'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { PageHeader, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'

const courses = [
  { title: 'Business Strategy Masterclass', category: 'Business Solutions', students: 124, price: '₹4,999', status: 'Active' },
  { title: 'Resume Building Bootcamp', category: 'Career Guidance', students: 89, price: '₹1,999', status: 'Active' },
  { title: 'Startup Foundation Program', category: 'Startup Hub', students: 56, price: '₹7,999', status: 'Active' },
  { title: 'Digital Marketing Essentials', category: 'Edu Tech', students: 201, price: '₹3,499', status: 'Active' },
  { title: 'Interview Preparation Pro', category: 'Career Guidance', students: 145, price: '₹2,499', status: 'Draft' },
  { title: 'Leadership & Management', category: 'Business Solutions', students: 78, price: '₹5,999', status: 'Active' },
  { title: 'Public Speaking Workshop', category: 'Young Compete', students: 0, price: '₹1,499', status: 'Draft' },
]

export default function CoursesPage() {
  const [search, setSearch] = useState('')

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Course Management"
        description="Create, edit, and manage all training courses"
        action={
          <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            New Course
          </button>
        }
      />

      <div className="bg-white border border-border rounded-xl p-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary-bright"
          />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl">
        <DashboardTable
          headers={['Course', 'Category', 'Students', 'Price', 'Status', 'Actions']}
          rows={filtered.map((c) => [
            <span key="t" className="font-medium text-primary">{c.title}</span>,
            <span key="c" className="text-xs bg-off-white px-2 py-1 rounded-md font-medium">{c.category}</span>,
            <span key="s" className="text-foreground/60">{c.students}</span>,
            <span key="p" className="font-semibold text-primary">{c.price}</span>,
            <StatusBadge key="st" status={c.status} />,
            <div key="a" className="flex items-center gap-2">
              <button className="text-foreground/40 hover:text-primary-bright"><Eye size={14} /></button>
              <button className="text-foreground/40 hover:text-primary"><Edit size={14} /></button>
              <button className="text-foreground/40 hover:text-red-500"><Trash2 size={14} /></button>
            </div>,
          ])}
        />
      </div>
    </div>
  )
}
