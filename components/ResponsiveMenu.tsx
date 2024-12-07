// .xywow-web/app/components/ResponsiveMenu.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Drawer } from "antd";
import { HomeOutlined, CalendarOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';

interface ResponsiveMenuProps {
    expand: boolean;
    onToggle: () => void;
}

export const ResponsiveMenu: React.FC<ResponsiveMenuProps> = ({ expand, onToggle }) => {
    const navItems = [
        { href: "/dashboard", label: "首页", icon: <HomeOutlined /> },
        { href: "/dashboard/appointment", label: "预约", icon: <CalendarOutlined /> },
        { href: "/dashboard/personal", label: "个人信息", icon: <UserOutlined /> },
    ];

    return (
        <div>
            <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}>
                <MenuOutlined onClick={onToggle} style={{ fontSize: '24px', cursor: 'pointer' }} />
            </div>
            <Drawer
                title="菜单"
                placement="right"
                closable={true}
                onClose={onToggle}
                open={expand}
            >
                <ul className="flex flex-col gap-4">
                    {navItems.map(item => (
                        <li key={item.href} className="hover:bg-gray-100 p-2 rounded" onClick={onToggle}>
                            <Link href={item.href}>
                                <div className="flex items-center gap-2">
                                    {item.icon} <span>{item.label}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </Drawer>
        </div>
    );
};
