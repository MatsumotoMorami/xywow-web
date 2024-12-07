// .xywow-web/app/components/Sidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Tooltip } from "antd";
import { HomeOutlined, CalendarOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

interface SidebarProps {
    expand: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ expand, onToggle }) => {
    const navItems = [
        { href: "/dashboard", label: "首页", icon: <HomeOutlined /> },
        { href: "/dashboard/appointment", label: "预约", icon: <CalendarOutlined /> },
        { href: "/dashboard/personal", label: "个人信息", icon: <UserOutlined /> },
    ];

    return (
        <div className={`sidebar-container ${expand ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
            <div className="sidebar-header" onClick={onToggle} style={{ cursor: 'pointer', padding: '10px' }}>
                {expand ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </div>
            <ul className="sidebar-nav">
                {navItems.map(item => (
                    <li key={item.href} className="sidebar-item">
                        <Link href={item.href}>
                            {expand ? (
                                <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded">
                                    {item.icon} <span>{item.label}</span>
                                </div>
                            ) : (
                                <Tooltip title={item.label} placement="right">
                                    <div className="px-4 py-2 hover:bg-gray-200 rounded">
                                        {item.icon}
                                    </div>
                                </Tooltip>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};
