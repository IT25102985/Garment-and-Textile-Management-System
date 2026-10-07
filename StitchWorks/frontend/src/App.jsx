import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FiFileText } from 'react-icons/fi';

// Layout components
import { AdminLayout, PublicLayout } from './components/layout';
import { ProtectedRoute, PlaceholderView } from './components/common';

// Page imports - Dashboard & Auth
import { Dashboard, UserProfile } from './pages/dashboard';
import { Login, AdminAuthGateway, PublicLogin, CustomerAuth } from './pages/auth';
import CustomerPortal from './pages/customer/CustomerPortal';

// Module page imports
import { UserManagement } from './pages/hr';
import RawMaterials from './pages/purchasing';
import { ProductDesign, Production } from './pages/production';
import { Inventory } from './pages/inventory';
import { Sales } from './pages/sales';
import { SizeRegistry } from './pages/product';

// Public pages
import {
    LandingPage,
    MaterialsOverviewPage,
    CategoryMaterialsPage,
    MaterialDetailPage,
    AboutPage,
    ContactPage
} from './pages/public';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <Router>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
                                <Route path="/materials" element={<PublicLayout><MaterialsOverviewPage /></PublicLayout>} />
                                <Route path="/materials/:category" element={<PublicLayout><CategoryMaterialsPage /></PublicLayout>} />
                                <Route path="/material/:id" element={<PublicLayout><MaterialDetailPage /></PublicLayout>} />
                                <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
                                <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
                                <Route path="/login" element={<PublicLayout><CustomerAuth /></PublicLayout>} />
                                <Route path="/register" element={<PublicLayout><CustomerAuth /></PublicLayout>} />
                                <Route path="/customer-auth" element={<Navigate to="/login" replace />} />
                                <Route path="/admin-auth" element={<Navigate to="/admin/login" replace />} />
                                <Route path="/admin/login" element={<PublicLayout><AdminAuthGateway /></PublicLayout>} />
                                
                                {/* Customer Portal Routes */}
                                <Route path="/customer" element={<ProtectedRoute roles={['CUSTOMER']}><PublicLayout><CustomerPortal /></PublicLayout></ProtectedRoute>} />
                                <Route path="/customer/*" element={<ProtectedRoute roles={['CUSTOMER']}><PublicLayout><CustomerPortal /></PublicLayout></ProtectedRoute>} />
                                
                                {/* Fully Functional Internal Admin Routes */}
                                <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN', 'STOREKEEPER', 'PURCHASING_OFFICER', 'SALES_OFFICER', 'PRODUCTION_STAFF']}><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
                                
                                <Route path="/admin/user-management" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
                                <Route path="/admin/hcm" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
                                
                                <Route path="/admin/profile" element={<ProtectedRoute roles={['ADMIN', 'STOREKEEPER', 'PURCHASING_OFFICER', 'SALES_OFFICER', 'PRODUCTION_STAFF']}><AdminLayout><UserProfile /></AdminLayout></ProtectedRoute>} />
                                
                                <Route path="/admin/raw-materials" element={<ProtectedRoute roles={['ADMIN', 'STOREKEEPER', 'PURCHASING_OFFICER']}><AdminLayout><RawMaterials /></AdminLayout></ProtectedRoute>} />
                                
                                {/* Phase 2 — Fully Functional Modules */}
                                <Route path="/admin/product-design" element={
                                    <ProtectedRoute roles={['ADMIN', 'PRODUCTION_STAFF']}>
                                        <AdminLayout><ProductDesign /></AdminLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/production" element={
                                    <ProtectedRoute roles={['ADMIN', 'PRODUCTION_STAFF']}>
                                        <AdminLayout><Production /></AdminLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/inventory" element={
                                    <ProtectedRoute roles={['ADMIN', 'STOREKEEPER']}>
                                        <AdminLayout><Inventory /></AdminLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/sales" element={
                                    <ProtectedRoute roles={['ADMIN', 'SALES_OFFICER']}>
                                        <AdminLayout><Sales /></AdminLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/supplier-applications" element={
                                    <ProtectedRoute roles={['ADMIN', 'PURCHASING_OFFICER']}>
                                        <AdminLayout>
                                            <PlaceholderView 
                                                title="Supplier Onboarding & Applications" 
                                                description="Review, verify, and approve incoming vendor procurement applications."
                                                icon={FiFileText}
                                                badgeText="Sprint Roadmap Phase 2"
                                                features={[
                                                    "Vendor compliance and textile cert evaluation",
                                                    "Digital contract signing and quotation negotiation",
                                                    "Automated vendor scorecard & performance rating"
                                                ]}
                                            />
                                        </AdminLayout>
                                    </ProtectedRoute>
                                } />
                                
                                {/* Catch-all redirect */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Router>
                        <ToastContainer position="bottom-right" />
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
