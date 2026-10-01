import DashboardLayout from '../layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../lib/api'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  mockCallData,
  mockRecentActivity,
  mockEmailsSent
} from '../lib/mockData'

const statusColours: Record<string, string> = {
  Incomplete: 'bg-orange-100 text-orange-700',
  New:        'bg-blue-100 text-blue-700',
  Closed:     'bg-red-100 text-red-700',
  Confirmed:  'bg-green-100 text-green-700',
  Contacted:  'bg-yellow-100 text-yellow-700',
}

export default function Statistics() {
  const navigate = useNavigate()
  const [calls, setCalls] = useState<{ day: string, calls: number }[]>([])
  const [totalCalls, setTotalCalls] = useState(0)

  useEffect(() => {
  api.get('/calls/')
    .then(res => {
      const data = res.data
      setTotalCalls(data.length)

      const dayCounts: Record<string, number> = {
        Monday: 0, Tuesday: 0, Wednesday: 0,
        Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
      }
      data.forEach((call: { created_at: string }) => {
        const day = new Date(call.created_at).toLocaleDateString('en-GB', { weekday: 'long' })
        if (dayCounts[day] !== undefined) {
          dayCounts[day]++
        }
      })
      setCalls(Object.entries(dayCounts).map(([day, count]) => ({
        day,
        calls: count
      })))
    })
    .catch(() => {
      setCalls(mockCallData)
    })
}, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">

          {/* Left column — chart + total */}
          <div className="col-span-2 flex flex-col gap-4">

            {/* Bar chart */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-900">Calls</h2>
                <span className="text-sm text-gray-500">This Week</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={calls}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="calls"
                    fill="#3B5BDB"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Total quotes */}
            <div className="bg-white rounded-xl p-4 flex items-center gap-6">
  <div>
    <p className="text-sm font-medium text-gray-900">Total calls</p>
    <p className="text-sm font-medium text-gray-900">in the system</p>
    <p className="text-xs text-gray-500 mt-1">All time</p>
  </div>
  <p className="text-4xl font-bold text-gray-900">{totalCalls}</p>
</div>

          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Log a call button */}
            <button
              onClick={() => navigate('/log-call')}
              className="bg-blue-600 text-white text-sm font-medium py-3 px-4 rounded-full hover:bg-blue-700 transition-colors"
            >
              + Log a call
            </button>

            {/* Recent activity */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
              <div className="flex flex-col gap-3">
                {mockRecentActivity.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColours[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emails/SMSs sent */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">Emails/SMSs sent</h3>
              <div className="flex flex-col gap-3">
                {mockEmailsSent.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.contact}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.type} confirmation sent ✅
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}