import {
  Search, Tag, X, Telescope, Target, BarChart3, Shield, Sparkles,
} from 'lucide-react';
import { SUGGESTED_KEYWORDS } from '../lib/main';
import {
  COMMON_INSIGHT_SUBOPTIONS,
  PREFERRED_METHOD_OPTIONS,
  PREFERRED_METHODS,
} from '../lib/monitoringMethods';

const METHOD_ICONS = {
  [PREFERRED_METHODS.KEYWORD]: Search,
  [PREFERRED_METHODS.INSTRUCTIONS]: Sparkles,
  [PREFERRED_METHODS.COMMON_INSIGHTS]: Target,
};

const SUBOPTION_ICONS = {
  'competitor-intelligence': Telescope,
  'project-status-bottlenecks': Target,
  'financial-risk-opportunity': BarChart3,
  'compliance-safety-risk': Shield,
};

export default function MonitoringMethodSection({
  config,
  setConfig,
  keywordInput,
  setKeywordInput,
  onAddKeyword,
  onAddSuggestedKeyword,
  onRemoveKeyword,
}) {
  const method = config.preferredMethod ?? PREFERRED_METHODS.KEYWORD;

  const setMethod = (preferredMethod) => {
    setConfig((prev) => ({ ...prev, preferredMethod }));
  };

  const toggleInsightSuboption = (id) => {
    setConfig((prev) => {
      const current = prev.insightsSuboptions ?? [];
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...prev, insightsSuboptions: next };
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="main-form-header text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-wa-green" /> What to look for?
      </h3>

      <div
        className="grid grid-cols-3 rounded-lg border border-gray-200 bg-wa-gray/50 p-1 gap-1"
        role="tablist"
        aria-label="Monitoring method"
      >
        {PREFERRED_METHOD_OPTIONS.map(({ value, label, shortLabel }) => {
          const Icon = METHOD_ICONS[value];
          const isActive = method === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              title={label}
              onClick={() => setMethod(value)}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors min-w-0 ${
                isActive
                  ? 'bg-white text-wa-dark shadow-sm ring-1 ring-gray-200/80'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-wa-green' : 'text-gray-400'}`} />
              <span className="truncate">{shortLabel}</span>
            </button>
          );
        })}
      </div>

      {method === PREFERRED_METHODS.KEYWORD && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Tag className="w-4 h-4 text-wa-green" /> AI Monitoring: By Keywords
          </p>
          <div className="flex flex-wrap gap-2" id="keywordTags">
            {(config.keywords ?? []).map((keyword, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-wa-light text-wa-dark text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => onRemoveKeyword(keyword)}
                  className="hover:text-red-500 transition-colors remove-keyword"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add keyword..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAddKeyword()}
              id="keywordInput"
              className="flex-1 bg-wa-gray border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-wa-green focus:outline-none"
            />
            <button
              type="button"
              onClick={onAddKeyword}
              id="addKeywordBtn"
              className="px-4 py-2.5 bg-wa-green text-white text-sm font-semibold rounded-lg hover:bg-wa-green/90 transition-colors"
            >
              Add
            </button>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Suggested keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_KEYWORDS.map((keyword) => {
                const isAdded = (config.keywords ?? []).includes(keyword);
                return (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => onAddSuggestedKeyword(keyword)}
                    disabled={isAdded}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                      isAdded
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-wa-gray text-gray-600 hover:bg-wa-light hover:text-wa-dark'
                    }`}
                  >
                    + {keyword}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {method === PREFERRED_METHODS.INSTRUCTIONS && (
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-wa-green" /> AI Monitoring: Open Instruction
              </p>
              <textarea
                value={config.promptInstructionsTemplate ?? ''}
                onChange={(e) => setConfig((prev) => ({
                  ...prev,
                  promptInstructionsTemplate: e.target.value,
                }))}
                rows={6}
                placeholder="E.g., Manager: Look for any mention of..."
                className="w-full bg-wa-gray border-0 rounded-lg px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-wa-green focus:outline-none resize-y min-h-[140px]"
              />
            </div>
            <div className="rounded-lg bg-wa-gray/60 p-4 text-sm text-gray-600 leading-relaxed">
              Ask your AI to monitor anything! Define specific topics, people, events, or implications.
            </div>
          </div>
        </div>
      )}

      {method === PREFERRED_METHODS.COMMON_INSIGHTS && (
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-wa-green" /> AI Monitoring: Common Summary Insights
              </p>
              <div className="space-y-2">
                {COMMON_INSIGHT_SUBOPTIONS.map((option) => {
                  const Icon = SUBOPTION_ICONS[option.id] ?? Target;
                  const checked = (config.insightsSuboptions ?? []).includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'border-wa-green/40 bg-wa-green/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleInsightSuboption(option.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-wa-green focus:ring-wa-green"
                      />
                      <Icon className="w-5 h-5 text-wa-green flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{option.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                        <p className="text-xs text-gray-400 mt-1 italic">{option.example}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="rounded-lg bg-wa-gray/60 p-4 text-sm text-gray-600 leading-relaxed">
              Automated predefined categories: your AI uses templates and contextual understanding to
              extract summaries for these common areas — no custom prompts needed.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
