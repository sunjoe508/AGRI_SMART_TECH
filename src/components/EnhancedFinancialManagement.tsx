import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
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
  CheckCircle
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
  
  const [activeModule, setActiveModule] = useState('overview');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [autoRecordingEnabled, setAutoRecordingEnabled] = useState(true);

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

  // Navigation modules
  const navigationModules = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Financial dashboard and insights' },
    { id: 'transactions', label: 'Transactions', icon: Wallet, description: 'Manage income and expenses' },
    { id: 'budgets', label: 'Budgets', icon: Target, description: 'Budget planning and tracking' },
    { id: 'reports', label: 'Reports', icon: FileText, description: 'Comprehensive financial reports' },
    { id: 'automation', label: 'Automation', icon: Activity, description: 'Auto-recording settings' },
    { id: 'analytics', label: 'Analytics', icon: PieChart, description: 'Advanced financial analytics' }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#10B981'];

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

  // Financial summary
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

  // Reporting data
  const reportingData = useMemo(() => {
    if (!transactions || !budgetAnalytics) return {};
    
    const monthlyTrends = {};
    const categoryBreakdown = {};
    
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
      
      if (!categoryBreakdown[transaction.category]) {
        categoryBreakdown[transaction.category] = { income: 0, expenses: 0 };
      }
      
      if (transaction.transaction_type === 'income') {
        categoryBreakdown[transaction.category].income += Number(transaction.amount);
      } else {
        categoryBreakdown[transaction.category].expenses += Number(transaction.amount);
      }
    });
    
    return {
      monthlyTrends: Object.values(monthlyTrends).slice(-6),
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => ({
        category,
        income: data.income,
        expenses: data.expenses,
        total: data.income + data.expenses
      }))
    };
  }, [transactions, budgetAnalytics]);

  const generateComprehensiveReport = () => {
    const jsPDF = require('jspdf');
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Financial Report', 20, 20);
    
    // User info
    pdf.setFontSize(12);
    pdf.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, 35);
    pdf.text(`User: ${user.email}`, 20, 45);
    
    // Financial Summary
    pdf.setFontSize(16);
    pdf.text('Financial Summary', 20, 65);
    pdf.setFontSize(12);
    pdf.text(`Total Income: $${financialSummary.totalIncome.toFixed(2)}`, 20, 80);
    pdf.text(`Total Expenses: $${financialSummary.totalExpenses.toFixed(2)}`, 20, 90);
    pdf.text(`Net Income: $${financialSummary.netIncome.toFixed(2)}`, 20, 100);
    pdf.text(`Budget Variance: ${financialSummary.budgetVariance.toFixed(2)}%`, 20, 110);
    
    // Recent Transactions
    pdf.setFontSize(16);
    pdf.text('Recent Transactions', 20, 130);
    pdf.setFontSize(10);
    
    let yPos = 145;
    const recentTransactions = (transactions || []).slice(0, 10);
    
    recentTransactions.forEach((transaction, index) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      
      const amount = transaction.transaction_type === 'income' ? `+$${transaction.amount}` : `-$${transaction.amount}`;
      pdf.text(`${format(new Date(transaction.transaction_date), 'MM/dd')} - ${transaction.description}: ${amount}`, 20, yPos);
      yPos += 10;
    });
    
    // Budget Status
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Budget Status', 20, 20);
    pdf.setFontSize(10);
    
    yPos = 35;
    budgetAnalytics.forEach((budget) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.text(`${budget.category}: $${budget.actualSpent.toFixed(2)} / $${budget.allocated_amount.toFixed(2)} (${budget.spentPercentage.toFixed(1)}%)`, 20, yPos);
      yPos += 15;
    });
    
    // Save PDF
    pdf.save(`financial-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: "📊 PDF Report Generated",
      description: "Comprehensive financial PDF report has been downloaded",
    });
  };

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

  // Finance Sidebar Component
  const FinanceSidebar = () => {
    return (
      <Sidebar className="w-64" collapsible="icon">
        <SidebarContent>
          <div className="p-4">
            <SidebarTrigger />
          </div>
          
          <SidebarGroup>
            <SidebarGroupLabel>Finance Center</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationModules.map((module) => {
                  const Icon = module.icon;
                  const isActive = activeModule === module.id;
                  
                  return (
                    <SidebarMenuItem key={module.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveModule(module.id)}
                        className={`w-full justify-start ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      >
                        <Icon className="w-4 h-4" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{module.label}</span>
                          <span className="text-xs opacity-70">{module.description}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <FinanceSidebar />
        
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Enhanced Header */}
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
                              {(newTransaction.transaction_type === 'income' ? 
                                ['Crop Sales', 'Subsidies', 'Grants', 'Consultancy', 'Equipment Rental', 'Other'] : 
                                ['Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Equipment', 'Fuel', 'Water', 'Rent', 'Insurance', 'Other']
                              ).map((category) => (
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
                              {['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque', 'Credit Card'].map((method) => (
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
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                                <Badge className={transaction.transaction_type === 'income' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>
                                  {transaction.transaction_type}
                                </Badge>
                              </TableCell>
                              <TableCell>{format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>{transaction.category}</TableCell>
                              <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                              <TableCell className={transaction.transaction_type === 'income' ? 'text-primary' : 'text-destructive'}>
                                KES {Number(transaction.amount).toLocaleString()}
                              </TableCell>
                              <TableCell>{transaction.payment_method || '-'}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Button size="sm" variant="ghost">
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost">
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
                      <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No transactions recorded yet. Start by adding your first transaction!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EnhancedFinancialManagement;