import React from 'react';
import AdminPanelHeader from './AdminPanelCompo/AdminPanelHeader';
import UserManagement from './AdminPanelCompo/UserManagement';

const page = () => {
    return (
        <div className="space-y-8 p-6">
            <AdminPanelHeader></AdminPanelHeader>
            <UserManagement></UserManagement>
 
        </div>
    );
};

export default page;