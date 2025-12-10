import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Download,
  Wallet,
  Target,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

interface EnhancedFinancialManagementProps {
  user: any;
}

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  category: string;
  amount: number;
  description: string;
  transaction_date: string;
  payment_method: string;
  created_at: string;
}

interface Budget {
  id: string;
  user_id: string;
  name: string;
  category: string;
  allocated_amount: number;
  budget_period: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

const EnhancedFinancialManagement = ({ user }: EnhancedFinancialManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    transaction_type: '',
    category: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: ''
  });

  // Fetch transactions - using type assertion for tables not in generated types
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['financial-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('orders' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as any);
      
      if (error) throw error;
      
      // Map orders to transaction-like structure
      return (data || []).map((order: any) => ({
        id: order.id,
        transaction_type: 'expense',
        category: 'Order',
        amount: order.total_amount || 0,
        description: order.product_name || 'Order',
        transaction_date: order.created_at,
        payment_method: 'N/A'
      }));
    },
    enabled: !!user?.id,
  });

  // Financial summary
  const financialSummary = useMemo(() => {
    const income = transactions.filter((t: any) => t.transaction_type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    const expenses = transactions.filter((t: any) => t.transaction_type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses
    };
  }, [transactions]);

  const generateReport = () => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(20);
    pdf.text('Financial Report', 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, 35);
    pdf.text(`User: ${user.email}`, 20, 45);
    
    pdf.setFontSize(16);
    pdf.text('Financial Summary', 20, 65);
    pdf.setFontSize(12);
    pdf.text(`Total Income: KES ${financialSummary.totalIncome.toLocaleString()}`, 20, 80);
    pdf.text(`Total Expenses: KES ${financialSummary.totalExpenses.toLocaleString()}`, 20, 90);
    pdf.text(`Net Income: KES ${financialSummary.netIncome.toLocaleString()}`, 20, 100);
    
    pdf.save(`financial-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: "📊 PDF Report Generated",
      description: "Financial report has been downloaded",
    });
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await (supabase
        .from('orders' as any)
        .insert({
          user_id: user.id,
          product_name: newTransaction.description,
          quantity: 1,
          total_amount: parseFloat(newTransaction.amount),
          status: 'completed'
        } as any) as any);
      
      if (error) throw error;
      
      toast({
        title: "✅ Transaction Added",
        description: "New transaction has been recorded",
      });

      setNewTransaction({
        transaction_type: '',
        category: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: ''
      });
      setIsAddingTransaction(false);
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to save transaction",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Finance Center</h2>
          <p className="text-muted-foreground">Manage your farm's financial activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setIsAddingTransaction(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  KES {financialSummary.totalIncome.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  KES {financialSummary.totalExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className={`text-2xl font-bold ${financialSummary.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  KES {financialSummary.netIncome.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Form */}
      {isAddingTransaction && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Type</Label>
                  <Select 
                    value={newTransaction.transaction_type}
                    onValueChange={(value) => setNewTransaction(prev => ({ ...prev, transaction_type: value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Category</Label>
                  <Select 
                    value={newTransaction.category}
                    onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seeds">Seeds</SelectItem>
                      <SelectItem value="fertilizers">Fertilizers</SelectItem>
                      <SelectItem value="labor">Labor</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Amount (KES)</Label>
                  <Input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Date</Label>
                  <Input
                    type="date"
                    value={newTransaction.transaction_date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, transaction_date: e.target.value }))}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-foreground">Description</Label>
                  <Input
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Save Transaction</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingTransaction(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Wallet className="w-5 h-5" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm">Add your first transaction to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Category</TableHead>
                  <TableHead className="text-foreground">Description</TableHead>
                  <TableHead className="text-right text-foreground">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 10).map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-foreground">
                      {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'}>
                        {transaction.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{transaction.category}</TableCell>
                    <TableCell className="text-foreground">{transaction.description}</TableCell>
                    <TableCell className={`text-right font-medium ${transaction.transaction_type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'} KES {Number(transaction.amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFinancialManagement;
