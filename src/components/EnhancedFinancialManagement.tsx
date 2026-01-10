import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  BarChart3,
  Edit,
  Trash2,
  Activity,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

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
  budget_id: string | null;
  created_at: string;
}

interface Budget {
  id: string;
  user_id: string;
  name: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  budget_period: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

interface ActivityLog {
  id: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

const EnhancedFinancialManagement = ({ user }: EnhancedFinancialManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('transactions');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  const [newTransaction, setNewTransaction] = useState({
    transaction_type: '',
    category: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    budget_id: ''
  });

  const [newBudget, setNewBudget] = useState({
    name: '',
    category: '',
    allocated_amount: '',
    budget_period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['financial-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Transaction[];
    },
    enabled: !!user?.id,
  });

  // Fetch budgets
  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Budget[];
    },
    enabled: !!user?.id,
  });

  // Fetch recent activity logs
  const { data: recentActivities = [] } = useQuery({
    queryKey: ['activity-logs', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return (data || []) as ActivityLog[];
    },
    enabled: !!user?.id,
  });

  const expenseCategories = [
    'Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Equipment', 'Fuel', 'Water', 'Rent', 'Insurance', 'Transport', 'Other'
  ];

  const incomeCategories = [
    'Crop Sales', 'Livestock Sales', 'Subsidies', 'Grants', 'Consultancy', 'Equipment Rental', 'Other'
  ];

  const paymentMethods = ['Cash', 'Bank Transfer', 'Mobile Money (M-Pesa)', 'Cheque', 'Credit Card'];

  // Financial summary with proper calculations
  const financialSummary = useMemo(() => {
    const income = transactions.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expenses = transactions.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      profitMargin: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0
    };
  }, [transactions]);

  // Budget utilization
  const budgetUtilization = useMemo(() => {
    return budgets.map(budget => {
      const budgetExpenses = transactions
        .filter(t => t.budget_id === budget.id && t.transaction_type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      
      return {
        ...budget,
        spent_amount: budgetExpenses,
        percentage: budget.allocated_amount > 0 ? (budgetExpenses / budget.allocated_amount * 100) : 0,
        remaining: budget.allocated_amount - budgetExpenses
      };
    });
  }, [budgets, transactions]);

  // Monthly trends data
  const monthlyData = useMemo(() => {
    const monthlyStats: Record<string, { income: number; expenses: number; month: string }> = {};
    
    transactions.forEach(transaction => {
      if (!transaction.transaction_date) return;
      const month = format(new Date(transaction.transaction_date), 'MMM yyyy');
      if (!monthlyStats[month]) {
        monthlyStats[month] = { income: 0, expenses: 0, month };
      }
      
      if (transaction.transaction_type === 'income') {
        monthlyStats[month].income += Number(transaction.amount || 0);
      } else {
        monthlyStats[month].expenses += Number(transaction.amount || 0);
      }
    });
    
    return Object.values(monthlyStats).slice(0, 6).reverse();
  }, [transactions]);

  // Expense breakdown by category
  const expenseBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    transactions
      .filter(t => t.transaction_type === 'expense')
      .forEach(t => {
        const category = t.category || 'Other';
        breakdown[category] = (breakdown[category] || 0) + Number(t.amount || 0);
      });
    
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions]);

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const { error } = await (supabase as any)
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          ...transactionData
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast({ title: "✅ Transaction Added", description: "Transaction recorded successfully" });
      resetTransactionForm();
    },
    onError: (error: any) => {
      toast({ title: "❌ Error", description: error.message, variant: "destructive" });
    }
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, ...transactionData }: any) => {
      const { error } = await (supabase as any)
        .from('financial_transactions')
        .update(transactionData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast({ title: "✅ Transaction Updated", description: "Transaction updated successfully" });
      resetTransactionForm();
    },
    onError: (error: any) => {
      toast({ title: "❌ Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('financial_transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast({ title: "✅ Transaction Deleted", description: "Transaction removed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "❌ Error", description: error.message, variant: "destructive" });
    }
  });

  // Add budget mutation
  const addBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      const { error } = await (supabase as any)
        .from('budgets')
        .insert({
          user_id: user.id,
          ...budgetData
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast({ title: "✅ Budget Created", description: "Budget created successfully" });
      resetBudgetForm();
    },
    onError: (error: any) => {
      toast({ title: "❌ Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete budget mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('budgets')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast({ title: "✅ Budget Deleted", description: "Budget removed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "❌ Error", description: error.message, variant: "destructive" });
    }
  });

  const resetTransactionForm = () => {
    setNewTransaction({
      transaction_type: '',
      category: '',
      amount: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
      payment_method: '',
      budget_id: ''
    });
    setIsAddingTransaction(false);
    setEditingTransaction(null);
  };

  const resetBudgetForm = () => {
    setNewBudget({
      name: '',
      category: '',
      allocated_amount: '',
      budget_period: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
    setIsAddingBudget(false);
    setEditingBudget(null);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      transaction_type: newTransaction.transaction_type,
      category: newTransaction.category,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      transaction_date: newTransaction.transaction_date,
      payment_method: newTransaction.payment_method,
      budget_id: newTransaction.budget_id || null
    };

    if (editingTransaction) {
      updateTransactionMutation.mutate({ id: editingTransaction.id, ...transactionData });
    } else {
      addTransactionMutation.mutate(transactionData);
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const budgetData = {
      name: newBudget.name,
      category: newBudget.category,
      allocated_amount: parseFloat(newBudget.allocated_amount),
      budget_period: newBudget.budget_period,
      start_date: newBudget.start_date,
      end_date: newBudget.end_date || null
    };

    addBudgetMutation.mutate(budgetData);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setNewTransaction({
      transaction_type: transaction.transaction_type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description || '',
      transaction_date: transaction.transaction_date,
      payment_method: transaction.payment_method || '',
      budget_id: transaction.budget_id || ''
    });
    setEditingTransaction(transaction);
    setIsAddingTransaction(true);
  };

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
    pdf.text(`Profit Margin: ${financialSummary.profitMargin}%`, 20, 110);
    
    pdf.setFontSize(16);
    pdf.text('Budget Overview', 20, 130);
    pdf.setFontSize(12);
    
    let yPos = 145;
    budgetUtilization.forEach((budget, index) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text(`${budget.name}: KES ${budget.spent_amount.toLocaleString()} / ${budget.allocated_amount.toLocaleString()} (${budget.percentage.toFixed(1)}%)`, 20, yPos);
      yPos += 10;
    });
    
    pdf.save(`financial-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: "📊 PDF Report Generated",
      description: "Financial report has been downloaded",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Finance Center</h2>
          <p className="text-muted-foreground text-sm md:text-base">Manage your farm's financial activities and budgets</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={generateReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Income</p>
                <p className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">
                  KES {financialSummary.totalIncome.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-lg md:text-2xl font-bold text-red-600 dark:text-red-400">
                  KES {financialSummary.totalExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Net Income</p>
                <p className={`text-lg md:text-2xl font-bold ${financialSummary.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  KES {financialSummary.netIncome.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Active Budgets</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {budgets.length}
                </p>
              </div>
              <Target className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-foreground text-base md:text-lg">
              <BarChart3 className="w-5 h-5" />
              <span>Monthly Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-foreground text-base md:text-lg">
              <PieChart className="w-5 h-5" />
              <span>Expense Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={expenseBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full lg:w-auto">
          <TabsTrigger value="transactions" className="text-xs md:text-sm">
            <Wallet className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="budgets" className="text-xs md:text-sm">
            <Target className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Budgets</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="text-xs md:text-sm">
            <Activity className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Activities</span>
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Financial Transactions</h3>
            <Button onClick={() => setIsAddingTransaction(!isAddingTransaction)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>

          {/* Transaction Form */}
          {isAddingTransaction && (
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-base">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransactionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select value={newTransaction.transaction_type} onValueChange={(value) => setNewTransaction({...newTransaction, transaction_type: value, category: ''})}>
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
                      <Label>Category *</Label>
                      <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {(newTransaction.transaction_type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Amount (KES) *</Label>
                      <Input
                        type="number"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        placeholder="Enter amount"
                        className="bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={newTransaction.transaction_date}
                        onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
                        className="bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select value={newTransaction.payment_method} onValueChange={(value) => setNewTransaction({...newTransaction, payment_method: value})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map(method => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {newTransaction.transaction_type === 'expense' && budgets.length > 0 && (
                      <div className="space-y-2">
                        <Label>Link to Budget</Label>
                        <Select value={newTransaction.budget_id} onValueChange={(value) => setNewTransaction({...newTransaction, budget_id: value})}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select budget (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No budget</SelectItem>
                            {budgets.map(budget => (
                              <SelectItem key={budget.id} value={budget.id}>{budget.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                      <Label>Description</Label>
                      <Input
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                        placeholder="Enter description"
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={addTransactionMutation.isPending || updateTransactionMutation.isPending}>
                      {editingTransaction ? 'Update' : 'Save'} Transaction
                    </Button>
                    <Button type="button" variant="outline" onClick={resetTransactionForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Transactions Table */}
          <Card className="bg-card">
            <CardContent className="p-0 md:p-4">
              {transactionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No transactions found</p>
                  <p className="text-sm">Add your first transaction to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-foreground">Date</TableHead>
                        <TableHead className="text-foreground">Type</TableHead>
                        <TableHead className="text-foreground hidden md:table-cell">Category</TableHead>
                        <TableHead className="text-foreground hidden lg:table-cell">Description</TableHead>
                        <TableHead className="text-right text-foreground">Amount</TableHead>
                        <TableHead className="text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 15).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-foreground text-sm">
                            {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'} className="text-xs">
                              {transaction.transaction_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground hidden md:table-cell text-sm">{transaction.category}</TableCell>
                          <TableCell className="text-foreground hidden lg:table-cell text-sm max-w-[200px] truncate">{transaction.description}</TableCell>
                          <TableCell className={`text-right font-medium text-sm ${transaction.transaction_type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {transaction.transaction_type === 'income' ? '+' : '-'} KES {Number(transaction.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditTransaction(transaction)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteTransactionMutation.mutate(transaction.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Budget Management</h3>
            <Button onClick={() => setIsAddingBudget(!isAddingBudget)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </div>

          {/* Budget Form */}
          {isAddingBudget && (
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-base">Create New Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBudgetSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Budget Name *</Label>
                      <Input
                        value={newBudget.name}
                        onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
                        placeholder="e.g., Monthly Seeds Budget"
                        className="bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={newBudget.category} onValueChange={(value) => setNewBudget({...newBudget, category: value})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Allocated Amount (KES) *</Label>
                      <Input
                        type="number"
                        value={newBudget.allocated_amount}
                        onChange={(e) => setNewBudget({...newBudget, allocated_amount: e.target.value})}
                        placeholder="Enter amount"
                        className="bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Period</Label>
                      <Select value={newBudget.budget_period} onValueChange={(value) => setNewBudget({...newBudget, budget_period: value})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={newBudget.start_date}
                        onChange={(e) => setNewBudget({...newBudget, start_date: e.target.value})}
                        className="bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={newBudget.end_date}
                        onChange={(e) => setNewBudget({...newBudget, end_date: e.target.value})}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={addBudgetMutation.isPending}>
                      Create Budget
                    </Button>
                    <Button type="button" variant="outline" onClick={resetBudgetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Budget Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetsLoading ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">Loading budgets...</div>
            ) : budgetUtilization.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No budgets created</p>
                <p className="text-sm">Create a budget to track your spending</p>
              </div>
            ) : (
              budgetUtilization.map((budget) => (
                <Card key={budget.id} className="bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-foreground text-base">{budget.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{budget.category} • {budget.budget_period}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteBudgetMutation.mutate(budget.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>KES {budget.spent_amount.toLocaleString()} spent</span>
                        <span>KES {budget.allocated_amount.toLocaleString()} allocated</span>
                      </div>
                      <Progress 
                        value={Math.min(budget.percentage, 100)} 
                        className={budget.percentage > 100 ? 'bg-red-200' : 'bg-gray-200'}
                      />
                      <div className="flex justify-between text-sm">
                        <Badge variant={budget.percentage > 100 ? 'destructive' : budget.percentage > 80 ? 'secondary' : 'default'}>
                          {budget.percentage.toFixed(1)}% used
                        </Badge>
                        <span className={budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {budget.remaining >= 0 ? `KES ${budget.remaining.toLocaleString()} remaining` : `KES ${Math.abs(budget.remaining).toLocaleString()} over budget`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Recent Activities</h3>
            <Badge variant="outline">{recentActivities.length} activities</Badge>
          </div>

          <Card className="bg-card">
            <CardContent className="p-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activities</p>
                  <p className="text-sm">Your activities will appear here automatically</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.activity_description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {activity.activity_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFinancialManagement;
