import { Activity, FileText, CheckCircle, Bell } from 'lucide-react';
import { getDisplayGroupCount } from '../lib/main';
import {
  formatInterval,
  formatBossNumber,
  formatGroupCount,
  formatKeywordCount,
} from '../utils/format';

export default function StatusPanel({ config }) {
  const groupCount = getDisplayGroupCount(config.groups);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-wa-green" />
            Agent Status
          </h3>
          <span className="flex items-center gap-1.5 text-sm text-wa-green font-semibold" id="statusBadge">
            <span className="w-2 h-2 bg-wa-green rounded-full animate-pulse" /> Running
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Groups monitored</span>
            <span className="text-sm font-semibold text-gray-800" id="groupCount">
              {formatGroupCount(groupCount)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Check interval</span>
            <span className="text-sm font-semibold text-gray-800" id="displayInterval">
              {formatInterval(config.interval)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Reporting to</span>
            <span className="text-sm font-semibold text-gray-800" id="displayNumber">
              {formatBossNumber(config.bossNumbers)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Keywords tracked</span>
            <span className="text-sm font-semibold text-gray-800" id="keywordCount">
              {formatKeywordCount(config.keywords.length)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Last checked</span>
            <span className="text-sm font-semibold text-gray-800" id="lastChecked">
              {config.lastChecked}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100 p-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-wa-green" />
          Latest Report Preview
        </h3>
        <div className="bg-wa-gray rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-wa-green rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Report Generated</p>
              <p className="text-xs text-gray-400">Today at 2:15 PM</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 text-sm text-gray-700 space-y-2">
            <p>📋 <strong>Summary for Boss:</strong></p>
            <ul className="space-y-1.5 text-xs text-gray-600 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-wa-green mt-0.5">●</span>
                <span>
                  Found <strong>&quot;deadline&quot;</strong> mentioned 3 times in{' '}
                  <strong>Marketing Team</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-wa-green mt-0.5">●</span>
                <span>
                  <strong>&quot;urgent&quot;</strong> flagged in <strong>Sales Pipeline</strong> by @John
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-wa-green mt-0.5">●</span>
                <span>
                  No mentions of <strong>&quot;Q4 report&quot;</strong> today
                </span>
              </li>
            </ul>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Report sent to +60 (10) 224-4567 via WhatsApp
          </p>
        </div>
      </div>

      <div
        id="toastNotification"
        className="bg-wa-dark text-white rounded-xl p-4 flex items-center gap-3 shadow-xl transition-all duration-300"
        style={{
          opacity: config.showToast ? 1 : 0,
          transform: config.showToast ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Configuration saved!</p>
          <p className="text-xs text-green-300">Agent is now monitoring with updated settings.</p>
        </div>
        <span className="text-xs text-white/50">Now</span>
      </div>
    </div>
  );
}
