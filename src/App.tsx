/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { AIInsights } from './components/AIInsights';
import { Settings } from './components/Settings';
import { Messages } from './components/Messages';
import { AppProvider } from './store';
import { AuthProvider, useAuth } from './auth';
import { Login } from './components/Login';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomerList />;
      case 'ai-insights':
        return <AIInsights />;
      case 'messages':
        return <Messages />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>该模块正在开发中...</p>
          </div>
        );
    }
  };

  return (
    <AppProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
