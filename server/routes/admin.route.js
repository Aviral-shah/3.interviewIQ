import express from "express";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import Payment from "../models/payment.model.js";

const adminRouter = express.Router();

adminRouter.get("/api/admin/db", async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const interviews = await Interview.find({}).lean();
    const payments = await Payment.find({}).lean();

    res.json({
      users,
      interviews,
      payments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get("/db-admin", (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InterviewIQ - MongoDB Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
    .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .table-container::-webkit-scrollbar { height: 8px; width: 8px; }
    .table-container::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  </style>
</head>
<body class="min-h-screen p-6 md:p-10">

  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass p-6 rounded-2xl">
      <div>
        <div class="flex items-center gap-3">
          <span class="text-3xl">🍃</span>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            InterviewIQ MongoDB Atlas Admin
          </h1>
        </div>
        <p class="text-slate-400 text-sm mt-1">Live MongoDB Cloud Database Dashboard</p>
      </div>

      <div class="flex items-center gap-3">
        <input type="text" id="searchInput" oninput="filterData()" placeholder="🔍 Search records..." 
          class="bg-slate-900/80 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-emerald-500 w-64" />
        <button onclick="fetchData()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20">
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass p-6 rounded-2xl flex items-center justify-between">
        <div>
          <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Users</p>
          <h3 id="statUsers" class="text-3xl font-bold text-white mt-1">0</h3>
        </div>
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">👤</div>
      </div>
      <div class="glass p-6 rounded-2xl flex items-center justify-between">
        <div>
          <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Interviews</p>
          <h3 id="statInterviews" class="text-3xl font-bold text-white mt-1">0</h3>
        </div>
        <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl">📝</div>
      </div>
      <div class="glass p-6 rounded-2xl flex items-center justify-between">
        <div>
          <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Payments</p>
          <h3 id="statPayments" class="text-3xl font-bold text-white mt-1">0</h3>
        </div>
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">💳</div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-slate-800 space-x-4">
      <button onclick="switchTab('users')" id="tabUsers" class="py-3 px-5 font-medium text-sm border-b-2 border-emerald-500 text-emerald-400 transition">
        Users (<span id="cntUsers">0</span>)
      </button>
      <button onclick="switchTab('interviews')" id="tabInterviews" class="py-3 px-5 font-medium text-sm border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition">
        Interviews (<span id="cntInterviews">0</span>)
      </button>
      <button onclick="switchTab('payments')" id="tabPayments" class="py-3 px-5 font-medium text-sm border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition">
        Payments (<span id="cntPayments">0</span>)
      </button>
    </div>

    <!-- Table Display Area -->
    <div class="glass rounded-2xl overflow-hidden">
      <div class="table-container overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead id="tableHead" class="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
          </thead>
          <tbody id="tableBody" class="divide-y divide-slate-800/60">
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- JSON Modal -->
  <div id="jsonModal" class="hidden fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="glass max-w-2xl w-full rounded-2xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">Details Viewer</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-white text-xl">&times;</button>
      </div>
      <pre id="jsonContent" class="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-y-auto max-h-96"></pre>
    </div>
  </div>

  <script>
    let dbData = { users: [], interviews: [], payments: [] };
    let currentTab = 'users';

    async function fetchData() {
      try {
        const res = await fetch('/api/admin/db');
        dbData = await res.json();
        
        document.getElementById('statUsers').innerText = dbData.users.length;
        document.getElementById('statInterviews').innerText = dbData.interviews.length;
        document.getElementById('statPayments').innerText = dbData.payments.length;

        document.getElementById('cntUsers').innerText = dbData.users.length;
        document.getElementById('cntInterviews').innerText = dbData.interviews.length;
        document.getElementById('cntPayments').innerText = dbData.payments.length;

        renderTable();
      } catch (err) {
        console.error("Failed to fetch database data:", err);
      }
    }

    function switchTab(tab) {
      currentTab = tab;
      ['users', 'interviews', 'payments'].forEach(t => {
        const btn = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (t === tab) {
          btn.className = "py-3 px-5 font-medium text-sm border-b-2 border-emerald-500 text-emerald-400 transition";
        } else {
          btn.className = "py-3 px-5 font-medium text-sm border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition";
        }
      });
      renderTable();
    }

    function filterData() {
      renderTable();
    }

    function renderTable() {
      const search = document.getElementById('searchInput').value.toLowerCase();
      const head = document.getElementById('tableHead');
      const body = document.getElementById('tableBody');

      let items = dbData[currentTab] || [];
      if (search) {
        items = items.filter(item => JSON.stringify(item).toLowerCase().includes(search));
      }

      if (currentTab === 'users') {
        head.innerHTML = \`
          <tr>
            <th class="px-6 py-4">ID</th>
            <th class="px-6 py-4">Name</th>
            <th class="px-6 py-4">Email</th>
            <th class="px-6 py-4">Credits</th>
            <th class="px-6 py-4">Created At</th>
          </tr>
        \`;
        body.innerHTML = items.map(u => \`
          <tr class="hover:bg-slate-800/40 transition">
            <td class="px-6 py-4 font-mono text-xs text-slate-400">\${u._id}</td>
            <td class="px-6 py-4 font-semibold text-white">\${u.name}</td>
            <td class="px-6 py-4 text-emerald-400">\${u.email}</td>
            <td class="px-6 py-4"><span class="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">\${u.credits} credits</span></td>
            <td class="px-6 py-4 text-xs text-slate-400">\${u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}</td>
          </tr>
        \`).join('') || '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No users found</td></tr>';
      } else if (currentTab === 'interviews') {
        head.innerHTML = \`
          <tr>
            <th class="px-6 py-4">ID</th>
            <th class="px-6 py-4">User ID</th>
            <th class="px-6 py-4">Role</th>
            <th class="px-6 py-4">Experience</th>
            <th class="px-6 py-4">Mode</th>
            <th class="px-6 py-4">Score</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">Questions</th>
          </tr>
        \`;
        body.innerHTML = items.map(i => \`
          <tr class="hover:bg-slate-800/40 transition">
            <td class="px-6 py-4 font-mono text-xs text-slate-400">\${i._id}</td>
            <td class="px-6 py-4 font-mono text-xs text-slate-400">\${i.userId}</td>
            <td class="px-6 py-4 font-semibold text-white">\${i.role}</td>
            <td class="px-6 py-4 text-slate-300">\${i.experience}</td>
            <td class="px-6 py-4"><span class="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">\${i.mode}</span></td>
            <td class="px-6 py-4 font-bold text-amber-400">\${i.finalScore}</td>
            <td class="px-6 py-4"><span class="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs">\${i.status}</span></td>
            <td class="px-6 py-4">
              <button onclick='showJson(\${JSON.stringify(i.questions || []).replace(/'/g, "&apos;")})' 
                class="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1 rounded-lg text-slate-300 transition">
                🔍 View (\${(i.questions || []).length})
              </button>
            </td>
          </tr>
        \`).join('') || '<tr><td colspan="8" class="px-6 py-8 text-center text-slate-500">No interviews found</td></tr>';
      } else if (currentTab === 'payments') {
        head.innerHTML = \`
          <tr>
            <th class="px-6 py-4">ID</th>
            <th class="px-6 py-4">User ID</th>
            <th class="px-6 py-4">Plan</th>
            <th class="px-6 py-4">Amount</th>
            <th class="px-6 py-4">Credits</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">Created At</th>
          </tr>
        \`;
        body.innerHTML = items.map(p => \`
          <tr class="hover:bg-slate-800/40 transition">
            <td class="px-6 py-4 font-mono text-xs text-slate-400">\${p._id}</td>
            <td class="px-6 py-4 font-mono text-xs text-slate-400">\${p.userId}</td>
            <td class="px-6 py-4 font-semibold text-white">\${p.planId || 'N/A'}</td>
            <td class="px-6 py-4 text-emerald-400 font-bold">₹\${p.amount}</td>
            <td class="px-6 py-4 text-blue-400">\${p.credits}</td>
            <td class="px-6 py-4"><span class="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs">\${p.status}</span></td>
            <td class="px-6 py-4 text-xs text-slate-400">\${p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}</td>
          </tr>
        \`).join('') || '<tr><td colspan="7" class="px-6 py-8 text-center text-slate-500">No payments found</td></tr>';
      }
    }

    function showJson(data) {
      document.getElementById('jsonContent').innerText = JSON.stringify(data, null, 2);
      document.getElementById('jsonModal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('jsonModal').classList.add('hidden');
    }

    fetchData();
  </script>
</body>
</html>
  `;
  res.send(html);
});

export default adminRouter;
