export const mockMetrics = {
  totalCalls: 87,
  quotesGenerated: 74,
  converted: 31,
  revenueQuoted: 248000
}

export const mockLeads = [
  {
    id: 1,
    name: 'Raeesa Moosa',
    phone: '082 441 9934',
    jobType: 'Bath · Enamel',
    suburb: 'Claremont',
    quote: 3200,
    date: '16 Aug',
    status: 'Confirmed'
  },
  {
    id: 2,
    name: 'James Davids',
    phone: '071 802 7541',
    jobType: 'Sink · Acrylic',
    suburb: 'Bellville',
    quote: 1900,
    date: '17 Aug',
    status: 'New'
  },
  {
    id: 3,
    name: 'Sharpe Evans',
    phone: '078 662 6612',
    jobType: 'Bath · Fibreglass',
    suburb: 'Hout Bay',
    quote: 3400,
    date: '24 July',
    status: 'Closed'
  },
  {
    id: 4,
    name: 'Unknown Caller',
    phone: '---',
    jobType: '---',
    suburb: '---',
    quote: 0,
    date: '10 Aug',
    status: 'Incomplete'
  }
]

export const mockCallData = [
  { day: 'Monday',    calls: 6  },
  { day: 'Tuesday',  calls: 9  },
  { day: 'Wednesday',calls: 8  },
  { day: 'Thursday', calls: 2  },
  { day: 'Friday',   calls: 10 },
  { day: 'Saturday', calls: 4  },
  { day: 'Sunday',   calls: 2  },
]

export const mockRecentActivity = [
  { name: 'Jessica Rae',     time: 'Today, 12:30',     status: 'Incomplete' },
  { name: 'Mohammed Cassim', time: 'Today, 09:20',     status: 'New'        },
  { name: 'Yelena Parker',   time: 'Yesterday, 17:47', status: 'Closed'     },
  { name: 'Jean Grey',       time: 'Yesterday, 18:01', status: 'New'        },
]

export const mockEmailsSent = [
  { name: 'Raeesa Moosa',    contact: 'RaeesaM23@gmail.com', type: 'Email' },
  { name: 'Mohammed Cassim', contact: '083 750 2138',         type: 'SMS'   },
  { name: 'Jean Grey',       contact: 'JGrey123@gmail.com',  type: 'Email' },
]