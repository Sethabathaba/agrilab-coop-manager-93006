
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const incomeExpenseData = [
  { month: "Jan", income: 45000, expenses: 32000 },
  { month: "Feb", income: 52000, expenses: 38000 },
  { month: "Mar", income: 48000, expenses: 35000 },
  { month: "Apr", income: 61000, expenses: 42000 },
  { month: "May", income: 55000, expenses: 40000 },
  { month: "Jun", income: 58000, expenses: 43000 }
];

const accountBalanceData = [
  { name: "Savings Account", value: 75320, color: "#0ea5e9" },
  { name: "Loans Receivable", value: 125000, color: "#10b981" },
  { name: "Share Capital", value: 450000, color: "#8b5cf6" },
  { name: "Operating Fund", value: 25000, color: "#f59e0b" },
  { name: "Reserve Fund", value: 35000, color: "#ef4444" }
];

const COLORS = ["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

export function FinancialOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="income-expense" className="space-y-4">
          <TabsList>
            <TabsTrigger value="income-expense">Income vs Expenses</TabsTrigger>
            <TabsTrigger value="account-balances">Account Balances</TabsTrigger>
          </TabsList>
          
          <TabsContent value="income-expense">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R ${value.toLocaleString()}`} />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="account-balances">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={accountBalanceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {accountBalanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
