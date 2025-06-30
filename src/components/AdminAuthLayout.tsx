
import React from 'react';
import { Shield, Sprout } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminAuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const AdminAuthLayout = ({ children, title, description }: AdminAuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-10 h-10 text-purple-600" />
            <Sprout className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-purple-800">AgriSmart Admin Portal</h1>
          <p className="text-gray-600">Secure Administrative Access</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-800 flex items-center justify-center space-x-2">
              <Shield className="w-6 h-6" />
              <span>{title}</span>
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuthLayout;
