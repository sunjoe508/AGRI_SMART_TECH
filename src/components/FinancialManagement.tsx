import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  PieChart, 
  Calculator,
  Edit3,
  Trash2,
  Wallet,
  Target,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface FinancialManagementProps {
  user: any;
}

const FinancialManagement = ({ user }: FinancialManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('transactions');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const [newTransaction, setNewTransaction] = useState({
    transaction_type: '',
    category: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: ''
  });

  const [newBudget, setNewBudget] = useState({
    name: '',
    category: '',
    allocated_amount: '',
    budget_period: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  // Fetch financial transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['financial-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch budgets
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const expenseCategories = [
    'Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Equipment', 'Fuel', 'Water', 'Rent', 'Insurance', 'Other'
  ];

  const incomeCategories = [
    'Crop Sales', 'Subsidies', 'Grants', 'Consultancy', 'Equipment Rental', 'Other'
  ];

  const paymentMethods = ['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque', 'Credit Card'];

  // Calculate financial summary
  const financialSummary = React.useMemo(() => {
    if (!transactions) return { totalIncome: 0, totalExpenses: 0, netIncome: 0 };
    
    const income = transactions.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses
    };
  }, [transactions]);

  // Prepare chart data
  const monthlyData = React.useMemo(() => {
    if (!transactions) return [];
    
    const monthlyStats: Record<string, { income: number; expenses: number; month: string }> = {};
    
    transactions.forEach(transaction => {
      const month = format(new Date(transaction.transaction_date), 'MMM yyyy');
      if (!monthlyStats[month]) {
        monthlyStats[month] = { income: 0, expenses: 0, month };
      }
      
      if (transaction.transaction_type === 'income') {
        monthlyStats[month].income += Number(transaction.amount);
      } else {
        monthlyStats[month].expenses += Number(transaction.amount);
      }
    });
    
    return Object.values(monthlyStats).slice(0, 6).reverse();
  }, [transactions]);

  const expenseBreakdown = React.useMemo(() => {
    if (!transactions) return [];
    
    const breakdown: Record<string, number> = {};
    transactions
      .filter(t => t.transaction_type === 'expense')
      .forEach(t => {
        breakdown[t.category] = (breakdown[t.category] || 0) + Number(t.amount);
      });
    
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        ...newTransaction,
        user_id: user.id,
        amount: parseFloat(newTransaction.amount)
      };

      if (editingTransaction) {
        const { error } = await supabase
          .from('financial_transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id);
        
        if (error) throw error;
        toast({
          title: "✅ Transaction Updated",
          description: "Financial transaction has been successfully updated",
        });
        setEditingTransaction(null);
      } else {
        const { error } = await supabase
          .from('financial_transactions')
          .insert([transactionData]);
        
        if (error) throw error;
        toast({
          title: "✅ Transaction Added",
          description: "New financial transaction has been successfully recorded",
        });
      }

      // Reset form
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

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const budgetData = {
        ...newBudget,
        user_id: user.id,
        allocated_amount: parseFloat(newBudget.allocated_amount)
      };

      if (editingBudget) {
        const { error } = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', editingBudget.id);
        
        if (error) throw error;
        toast({
          title: "✅ Budget Updated",
          description: "Budget has been successfully updated",
        });
        setEditingBudget(null);
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert([budgetData]);
        
        if (error) throw error;
        toast({
          title: "✅ Budget Created",
          description: "New budget has been successfully created",
        });
      }

      // Reset form
      setNewBudget({
        name: '',
        category: '',
        allocated_amount: '',
        budget_period: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });
      setIsAddingBudget(false);
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to save budget",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({
        title: "✅ Transaction Deleted",
        description: "Transaction has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({
        title: "✅ Budget Deleted",
        description: "Budget has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to delete budget",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Track your farm income, expenses, and budgets</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  KES {financialSummary.totalIncome.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  KES {financialSummary.totalExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Income</p>
                <p className={`text-2xl font-bold ${financialSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  KES {financialSummary.netIncome.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Budgets</p>
                <p className="text-2xl font-bold text-blue-600">
                  {budgets?.length || 0}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Monthly Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Expense Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={expenseBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <Wallet className="w-4 h-4" />
            <span>Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Budgets</span>
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Financial Transactions</h3>
            <Button onClick={() => setIsAddingTransaction(!isAddingTransaction)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>

          {/* Transaction Form */}
          {isAddingTransaction && (
            <Card>
              <CardHeader>
                <CardTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransactionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="transaction_type">Type *</Label>
                      <Select value={newTransaction.transaction_type} onValueChange={(value) => setNewTransaction({...newTransaction, transaction_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {(newTransaction.transaction_type === 'income' ? incomeCategories : expenseCategories).map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount (KES) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="transaction_date">Date *</Label>
                      <Input
                        id="transaction_date"
                        type="date"
                        value={newTransaction.transaction_date}
                        onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select value={newTransaction.payment_method} onValueChange={(value) => setNewTransaction({...newTransaction, payment_method: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      placeholder="Describe this transaction..."
                      required
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit">
                      {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingTransaction(false);
                        setEditingTransaction(null);
                        setNewTransaction({
                          transaction_type: '',
                          category: '',
                          amount: '',
                          description: '',
                          transaction_date: new Date().toISOString().split('T')[0],
                          payment_method: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Transactions Table */}
          <Card>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Badge className={transaction.transaction_type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {transaction.transaction_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                          <TableCell className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            KES {Number(transaction.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>{transaction.payment_method || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button size="sm" variant="ghost">
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDeleteTransaction(transaction.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions recorded yet. Start by adding your first transaction!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Budget Management</h3>
            <Button onClick={() => setIsAddingBudget(!isAddingBudget)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </div>

          {/* Budget Form */}
          {isAddingBudget && (
            <Card>
              <CardHeader>
                <CardTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBudgetSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget_name">Budget Name *</Label>
                      <Input
                        id="budget_name"
                        value={newBudget.name}
                        onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
                        placeholder="e.g., Maize Season 2024"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget_category">Category *</Label>
                      <Select value={newBudget.category} onValueChange={(value) => setNewBudget({...newBudget, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="allocated_amount">Allocated Amount (KES) *</Label>
                      <Input
                        id="allocated_amount"
                        type="number"
                        step="0.01"
                        value={newBudget.allocated_amount}
                        onChange={(e) => setNewBudget({...newBudget, allocated_amount: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget_period">Budget Period *</Label>
                      <Select value={newBudget.budget_period} onValueChange={(value) => setNewBudget({...newBudget, budget_period: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="seasonal">Seasonal</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newBudget.start_date}
                        onChange={(e) => setNewBudget({...newBudget, start_date: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newBudget.end_date}
                        onChange={(e) => setNewBudget({...newBudget, end_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit">
                      {editingBudget ? 'Update Budget' : 'Create Budget'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingBudget(false);
                        setEditingBudget(null);
                        setNewBudget({
                          name: '',
                          category: '',
                          allocated_amount: '',
                          budget_period: '',
                          start_date: new Date().toISOString().split('T')[0],
                          end_date: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Budgets List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : budgets && budgets.length > 0 ? (
              budgets.map((budget: any) => {
                const spentPercentage = (budget.spent_amount / budget.allocated_amount) * 100;
                const remaining = budget.allocated_amount - budget.spent_amount;
                
                return (
                  <Card key={budget.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{budget.name}</CardTitle>
                          <p className="text-sm text-gray-600">{budget.category}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteBudget(budget.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Spent: KES {budget.spent_amount.toLocaleString()}</span>
                          <span>Budget: KES {budget.allocated_amount.toLocaleString()}</span>
                        </div>
                        <Progress value={spentPercentage} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">
                          {spentPercentage.toFixed(1)}% used • KES {remaining.toLocaleString()} remaining
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Period: {budget.budget_period}</p>
                        <p>Duration: {format(new Date(budget.start_date), 'MMM dd')} - {format(new Date(budget.end_date), 'MMM dd, yyyy')}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No budgets created yet. Start by creating your first budget!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;