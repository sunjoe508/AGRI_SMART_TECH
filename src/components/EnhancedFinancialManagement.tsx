import React, { useState, useEffect, useMemo } from 'react';
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  BarChart3,
  FileText,
  Download,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Menu
} from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         PieChart as RechartsPieChart, Cell, Pie, LineChart, Line, Legend } from 'recharts';

interface EnhancedFinancialManagementProps {
  user: any;
}

const EnhancedFinancialManagement = ({ user }: EnhancedFinancialManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Centralized state management
  const [activeModule, setActiveModule] = useState('overview');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [autoRecordingEnabled, setAutoRecordingEnabled] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('monthly');

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

  // Data fetching
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

  // Enhanced budget tracking with real-time updates
  const budgetAnalytics = useMemo(() => {
    if (!budgets || !transactions) return [];
    
    return budgets.map(budget => {
      // Get transactions within budget period and category
      const relevantTransactions = transactions.filter(transaction => {
        const transactionDate = parseISO(transaction.transaction_date);
        const startDate = parseISO(budget.start_date);
        const endDate = parseISO(budget.end_date);
        
        return transaction.transaction_type === 'expense' &&
               transaction.category === budget.category &&
               isWithinInterval(transactionDate, { start: startDate, end: endDate });
      });
      
      const actualSpent = relevantTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const remaining = budget.allocated_amount - actualSpent;
      const spentPercentage = (actualSpent / budget.allocated_amount) * 100;
      const isOverBudget = actualSpent > budget.allocated_amount;
      const isNearLimit = spentPercentage > 80 && !isOverBudget;
      
      return {
        ...budget,
        actualSpent,
        remaining,
        spentPercentage,
        isOverBudget,
        isNearLimit,
        relevantTransactions
      };
    });
  }, [budgets, transactions]);

  // Auto-update budget spent amounts
  useEffect(() => {
    if (!budgetAnalytics.length) return;
    
    budgetAnalytics.forEach(async (budget) => {
      if (budget.spent_amount !== budget.actualSpent) {
        try {
          await supabase
            .from('budgets')
            .update({ spent_amount: budget.actualSpent })
            .eq('id', budget.id);
        } catch (error) {
          console.error('Error updating budget:', error);
        }
      }
    });
  }, [budgetAnalytics]);

  // Financial summary with enhanced metrics
  const financialSummary = useMemo(() => {
    if (!transactions) return { 
      totalIncome: 0, 
      totalExpenses: 0, 
      netIncome: 0,
      avgMonthlyIncome: 0,
      avgMonthlyExpenses: 0,
      totalBudgeted: 0,
      budgetVariance: 0
    };
    
    const income = transactions.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalBudgeted = budgetAnalytics.reduce((sum, b) => sum + b.allocated_amount, 0);
    const totalSpent = budgetAnalytics.reduce((sum, b) => sum + b.actualSpent, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      avgMonthlyIncome: income / 12,
      avgMonthlyExpenses: expenses / 12,
      totalBudgeted,
      budgetVariance: totalBudgeted - totalSpent
    };
  }, [transactions, budgetAnalytics]);

  // Auto-recording functionality
  const autoRecordTransaction = async (type: string, category: string, amount: number, description: string) => {
    if (!autoRecordingEnabled) return;
    
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .insert([{
          user_id: user.id,
          transaction_type: type,
          category,
          amount,
          description: `[AUTO] ${description}`,
          transaction_date: new Date().toISOString().split('T')[0],
          payment_method: 'System Generated'
        }]);
      
      if (error) throw error;
      
      toast({
        title: "🤖 Auto-Recording",
        description: `Automatically recorded ${type}: KES ${amount.toLocaleString()}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
    } catch (error: any) {
      console.error('Auto-recording failed:', error);
    }
  };

  // Comprehensive reporting data
  const reportingData = useMemo(() => {
    if (!transactions || !budgetAnalytics) return {};
    
    const monthlyTrends = {};
    const categoryBreakdown = {};
    const paymentMethodStats = {};
    const budgetPerformance = {};
    
    transactions.forEach(transaction => {
      const month = format(new Date(transaction.transaction_date), 'MMM yyyy');
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = { income: 0, expenses: 0, month };
      }
      
      if (transaction.transaction_type === 'income') {
        monthlyTrends[month].income += Number(transaction.amount);
      } else {
        monthlyTrends[month].expenses += Number(transaction.amount);
      }
      
      // Category breakdown
      if (!categoryBreakdown[transaction.category]) {
        categoryBreakdown[transaction.category] = { income: 0, expenses: 0 };
      }
      
      if (transaction.transaction_type === 'income') {
        categoryBreakdown[transaction.category].income += Number(transaction.amount);
      } else {
        categoryBreakdown[transaction.category].expenses += Number(transaction.amount);
      }
      
      // Payment method stats
      if (transaction.payment_method) {
        paymentMethodStats[transaction.payment_method] = (paymentMethodStats[transaction.payment_method] || 0) + Number(transaction.amount);
      }
    });
    
    // Budget performance
    budgetAnalytics.forEach(budget => {
      budgetPerformance[budget.name] = {
        allocated: budget.allocated_amount,
        spent: budget.actualSpent,
        variance: budget.remaining,
        performance: budget.spentPercentage
      };
    });
    
    return {
      monthlyTrends: Object.values(monthlyTrends).slice(-6),
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => ({
        category,
        income: data.income,
        expenses: data.expenses,
        total: data.income + data.expenses
      })),
      paymentMethodStats: Object.entries(paymentMethodStats).map(([method, amount]) => ({
        method,
        amount
      })),
      budgetPerformance: Object.entries(budgetPerformance).map(([name, data]: [string, any]) => ({
        name,
        allocated: data.allocated,
        spent: data.spent,
        variance: data.variance,
        performance: data.performance
      }))
    };
  }, [transactions, budgetAnalytics]);

  const generateComprehensiveReport = () => {
    const reportData = {
      summary: financialSummary,
      transactions: transactions?.slice(0, 100) || [],
      budgets: budgetAnalytics,
      analytics: reportingData,
      generatedAt: new Date().toISOString(),
      period: reportPeriod
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "📊 Report Generated",
      description: "Comprehensive financial report has been downloaded",
    });
  };

  // Centralized navigation menu
  const navigationModules = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Financial dashboard and insights' },
    { id: 'transactions', label: 'Transactions', icon: Wallet, description: 'Manage income and expenses' },
    { id: 'budgets', label: 'Budgets', icon: Target, description: 'Budget planning and tracking' },
    { id: 'reports', label: 'Reports', icon: FileText, description: 'Comprehensive financial reports' },
    { id: 'automation', label: 'Automation', icon: Activity, description: 'Auto-recording settings' },
    { id: 'analytics', label: 'Analytics', icon: PieChart, description: 'Advanced financial analytics' }
  ];

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

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#10B981'];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Enhanced Finance Center</h2>
          <p className="text-muted-foreground">Automated financial management with real-time insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateComprehensiveReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Centralized Navigation Menu */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Finance Modules</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {navigationModules.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  variant={activeModule === module.id ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-medium">{module.label}</div>
                    <div className="text-xs opacity-70">{module.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alert System for Budget Notifications */}
      {budgetAnalytics.some(b => b.isOverBudget || b.isNearLimit) && (
        <div className="space-y-2">
          {budgetAnalytics.filter(b => b.isOverBudget).map(budget => (
            <Alert key={budget.id} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{budget.name}</strong> is over budget by KES {Math.abs(budget.remaining).toLocaleString()}
              </AlertDescription>
            </Alert>
          ))}
          {budgetAnalytics.filter(b => b.isNearLimit).map(budget => (
            <Alert key={budget.id}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{budget.name}</strong> is at {budget.spentPercentage.toFixed(1)}% of budget
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Module Content */}
      {activeModule === 'overview' && (
        <div className="space-y-6">
          {/* Enhanced Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Income</p>
                    <p className="text-2xl font-bold text-primary">
                      KES {financialSummary.totalIncome.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg: KES {financialSummary.avgMonthlyIncome.toLocaleString()}/month
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-destructive">
                      KES {financialSummary.totalExpenses.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg: KES {financialSummary.avgMonthlyExpenses.toLocaleString()}/month
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Income</p>
                    <p className={`text-2xl font-bold ${financialSummary.netIncome >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      KES {financialSummary.netIncome.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Profit Margin: {((financialSummary.netIncome / financialSummary.totalIncome) * 100 || 0).toFixed(1)}%
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Performance</p>
                    <p className={`text-2xl font-bold ${financialSummary.budgetVariance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      KES {financialSummary.budgetVariance.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {budgetAnalytics.length} active budgets
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Budget Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Real-time Budget Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetAnalytics.map((budget) => (
                  <Card key={budget.id} className={`border-l-4 ${
                    budget.isOverBudget ? 'border-l-destructive' : 
                    budget.isNearLimit ? 'border-l-yellow-500' : 'border-l-primary'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{budget.name}</h4>
                        {budget.isOverBudget && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        {budget.isNearLimit && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        {!budget.isOverBudget && !budget.isNearLimit && <CheckCircle className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="space-y-2">
                        <Progress 
                          value={Math.min(budget.spentPercentage, 100)} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-sm">
                          <span>KES {budget.actualSpent.toLocaleString()}</span>
                          <span>KES {budget.allocated_amount.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {budget.spentPercentage.toFixed(1)}% used • 
                          KES {Math.abs(budget.remaining).toLocaleString()} {budget.remaining >= 0 ? 'remaining' : 'over'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Financial Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportingData.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="income" fill="hsl(var(--primary))" name="Income" />
                    <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={reportingData.categoryBreakdown?.slice(0, 5) || []}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      label
                    >
                      {(reportingData.categoryBreakdown?.slice(0, 5) || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Transactions Module */}
      {activeModule === 'transactions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Transaction Management</h3>
            <Button onClick={() => setIsAddingTransaction(!isAddingTransaction)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
          
          {isAddingTransaction && (
            <Card>
              <CardHeader>
                <CardTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransactionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="transaction_type">Transaction Type</Label>
                      <Select 
                        value={newTransaction.transaction_type} 
                        onValueChange={(value) => setNewTransaction({...newTransaction, transaction_type: value})}
                      >
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
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={newTransaction.category} 
                        onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Crop Sales">Crop Sales</SelectItem>
                          <SelectItem value="Equipment">Equipment</SelectItem>
                          <SelectItem value="Seeds">Seeds</SelectItem>
                          <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                          <SelectItem value="Labor">Labor</SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (KES)</Label>
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
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select 
                        value={newTransaction.payment_method} 
                        onValueChange={(value) => setNewTransaction({...newTransaction, payment_method: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="transaction_date">Date</Label>
                      <Input
                        id="transaction_date"
                        type="date"
                        value={newTransaction.transaction_date}
                        onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      placeholder="Enter transaction description..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'}>
                          {transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                      <TableCell className={transaction.transaction_type === 'income' ? 'text-primary' : 'text-destructive'}>
                        KES {Number(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{transaction.payment_method}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTransaction(transaction);
                              setNewTransaction({
                                transaction_type: transaction.transaction_type,
                                category: transaction.category,
                                amount: transaction.amount.toString(),
                                description: transaction.description || '',
                                transaction_date: transaction.transaction_date,
                                payment_method: transaction.payment_method || ''
                              });
                              setIsAddingTransaction(true);
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budgets Module */}
      {activeModule === 'budgets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Budget Management</h3>
            <Button onClick={() => setIsAddingBudget(!isAddingBudget)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </div>
          
          {isAddingBudget && (
            <Card>
              <CardHeader>
                <CardTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBudgetSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget_name">Budget Name</Label>
                      <Input
                        id="budget_name"
                        value={newBudget.name}
                        onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
                        placeholder="e.g., Monthly Equipment Budget"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget_category">Category</Label>
                      <Select 
                        value={newBudget.category} 
                        onValueChange={(value) => setNewBudget({...newBudget, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Equipment">Equipment</SelectItem>
                          <SelectItem value="Seeds">Seeds</SelectItem>
                          <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                          <SelectItem value="Labor">Labor</SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="allocated_amount">Allocated Amount (KES)</Label>
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
                      <Label htmlFor="budget_period">Budget Period</Label>
                      <Select 
                        value={newBudget.budget_period} 
                        onValueChange={(value) => setNewBudget({...newBudget, budget_period: value})}
                      >
                        <SelectTrigger>
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
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newBudget.start_date}
                        onChange={(e) => setNewBudget({...newBudget, start_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newBudget.end_date}
                        onChange={(e) => setNewBudget({...newBudget, end_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetAnalytics.map((budget) => (
              <Card key={budget.id} className={`border-l-4 ${
                budget.isOverBudget ? 'border-l-destructive' : 
                budget.isNearLimit ? 'border-l-yellow-500' : 'border-l-primary'
              }`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium">{budget.name}</h4>
                      <p className="text-sm text-muted-foreground">{budget.category}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingBudget(budget);
                          setNewBudget({
                            name: budget.name,
                            category: budget.category,
                            allocated_amount: budget.allocated_amount.toString(),
                            budget_period: budget.budget_period,
                            start_date: budget.start_date,
                            end_date: budget.end_date
                          });
                          setIsAddingBudget(true);
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(budget.spentPercentage, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span>Spent: KES {budget.actualSpent.toLocaleString()}</span>
                      <span>Budget: KES {budget.allocated_amount.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {budget.spentPercentage.toFixed(1)}% used • 
                      KES {Math.abs(budget.remaining).toLocaleString()} {budget.remaining >= 0 ? 'remaining' : 'over'}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{format(new Date(budget.start_date), 'MMM dd')}</span>
                      <span>{format(new Date(budget.end_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reports Module */}
      {activeModule === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Financial Reports</h3>
            <div className="flex gap-2">
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={generateComprehensiveReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Performance Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportingData.budgetPerformance?.map((budget, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{budget.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {budget.performance?.toFixed(1)}% utilized
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KES {budget.variance?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {budget.variance >= 0 ? 'Under budget' : 'Over budget'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportingData.paymentMethodStats?.map((method, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{method.method}</span>
                      <span>KES {method.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={reportingData.monthlyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" name="Income" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" name="Expenses" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Module */}
      {activeModule === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Advanced Financial Analytics</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportingData.categoryBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="income" fill="hsl(var(--primary))" name="Income" />
                    <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {Math.max(0, Math.min(100, ((financialSummary.netIncome / financialSummary.totalIncome) * 100) || 0)).toFixed(0)}
                  </div>
                  <p className="text-muted-foreground">Health Score</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Profit Margin</span>
                    <span className="font-medium">
                      {((financialSummary.netIncome / financialSummary.totalIncome) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget Adherence</span>
                    <span className="font-medium">
                      {budgetAnalytics.length > 0 ? 
                        (budgetAnalytics.filter(b => !b.isOverBudget).length / budgetAnalytics.length * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expense Ratio</span>
                    <span className="font-medium">
                      {((financialSummary.totalExpenses / financialSummary.totalIncome) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Automation Module */}
      {activeModule === 'automation' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Auto-Recording Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable Auto-Recording</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically record financial activities from system actions
                </p>
              </div>
              <Button 
                variant={autoRecordingEnabled ? "default" : "outline"}
                onClick={() => setAutoRecordingEnabled(!autoRecordingEnabled)}
              >
                {autoRecordingEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Auto-Recording Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Equipment Purchase:</span> Auto-record as Equipment expense
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Crop Sales:</span> Auto-record as Crop Sales income
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Labor Payments:</span> Auto-record as Labor expense
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Input Purchases:</span> Auto-record as respective category
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedFinancialManagement;
