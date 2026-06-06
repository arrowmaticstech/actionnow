import { useState } from 'react';
import {
  MapPin, Phone, Download, X, Users, PlusCircle, Plus, Send,
  Search, Tag, FileText, Clock, Calendar, Repeat, Save, Loader2,
} from 'lucide-react';
import { fetchWhatsAppGroups, saveConfiguration } from '../api/start';
import { pickRandomGroupName, SAVE_FLASH_MS } from '../lib/main';

export default function ConfigPanel({ config, setConfig, onSave }) {
  const [waPhoneNumber, setWaPhoneNumber] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedGroups, setFetchedGroups] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [saveState, setSaveState] = useState('idle');

  const handleFetchGroups = async () => {
    if (!waPhoneNumber.trim()) {
      alert('Please enter a WhatsApp number first.');
      return;
    }

    setIsFetching(true);
    try {
      const groups = await fetchWhatsAppGroups(waPhoneNumber.trim());
      setFetchedGroups(groups);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching groups:', error);
      alert(error.message === 'Failed to fetch groups'
        ? 'Failed to fetch groups. Please try again.'
        : 'An error occurred while fetching groups.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddGroup = (groupName) => {
    if (!config.groups.includes(groupName)) {
      setConfig((prev) => ({ ...prev, groups: [...prev.groups, groupName] }));
    }
  };

  const handleAddRandomGroup = () => {
    const randomName = pickRandomGroupName();
    if (!config.groups.includes(randomName)) {
      setConfig((prev) => ({ ...prev, groups: [...prev.groups, randomName] }));
    }
  };

  const handleRemoveGroup = (groupName) => {
    setConfig((prev) => ({ ...prev, groups: prev.groups.filter((g) => g !== groupName) }));
  };

  const handleAddBossNumber = () => {
    setConfig((prev) => ({ ...prev, bossNumbers: [...prev.bossNumbers, ''] }));
  };

  const handleUpdateBossNumber = (index, value) => {
    const newBossNumbers = [...config.bossNumbers];
    newBossNumbers[index] = value;
    setConfig((prev) => ({ ...prev, bossNumbers: newBossNumbers }));
  };

  const handleRemoveBossNumber = (index) => {
    setConfig((prev) => ({ ...prev, bossNumbers: prev.bossNumbers.filter((_, i) => i !== index) }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !config.keywords.includes(keywordInput.trim())) {
      setConfig((prev) => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setConfig((prev) => ({ ...prev, keywords: prev.keywords.filter((k) => k !== keyword) }));
  };

  const toggleContentType = (type) => {
    setConfig((prev) => ({
      ...prev,
      contentTypes: { ...prev.contentTypes, [type]: !prev.contentTypes[type] },
    }));
  };

  const handleSave = async () => {
    try {
      await saveConfiguration(config);
    } catch (error) {
      console.error('Error sending data to API:', error);
    }

    onSave();
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), SAVE_FLASH_MS);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100 overflow-hidden">
      <div className="bg-wa-dark px-6 py-4 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="text-white/80 text-sm font-medium ml-3">Agent Configuration Panel</span>
      </div>

      <div className="p-6 space-y-8 text-left">
        <div className="space-y-3">
          <h3 className="main-form-header text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-wa-green" /> From: (the where)
          </h3>
          <div>
            <div className="mb-4 relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> Your WhatsApp Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="waPhoneNumber"
                  value={waPhoneNumber}
                  onChange={(e) => setWaPhoneNumber(e.target.value)}
                  placeholder="e.g. 60123456789"
                  className="flex-1 bg-wa-gray border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-wa-green focus:outline-none"
                />
                <button
                  id="fetchGroupsBtn"
                  onClick={handleFetchGroups}
                  disabled={isFetching}
                  className="px-4 py-2.5 bg-wa-green text-white text-sm font-semibold rounded-lg hover:bg-wa-green/90 transition-colors active:scale-95 flex items-center gap-2 disabled:opacity-70"
                >
                  {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isFetching ? 'Fetching...' : 'Fetch'}
                </button>
              </div>

              {showDropdown && (
                <div
                  id="fetchedDropdown"
                  className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-48 overflow-y-auto z-10"
                >
                  <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Select Groups to Add
                    </span>
                    <button
                      id="closeDropdownBtn"
                      onClick={() => setShowDropdown(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-1" id="fetchedDropdownList">
                    {fetchedGroups.length === 0 ? (
                      <p className="text-sm text-gray-500 p-2">No groups found.</p>
                    ) : (
                      fetchedGroups.map((g, i) => (
                        <div
                          key={i}
                          onClick={() => handleAddGroup(g)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-wa-gray rounded cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 flex-1 truncate">{g}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" /> Groups to Monitor
            </label>
            <div className="space-y-2" id="groupList">
              {config.groups.map((group, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-wa-gray rounded-lg px-3 py-2.5 animate-slide-up"
                >
                  <span className="text-sm text-gray-600 flex-1 truncate">{group}</span>
                  <span className="text-xs text-wa-green font-medium bg-wa-light px-2 py-0.5 rounded-full">Active</span>
                  <button
                    onClick={() => handleRemoveGroup(group)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 remove-group"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddRandomGroup}
              id="addGroupBtn"
              className="hidden mt-3 flex items-center gap-2 text-sm font-medium text-wa-green hover:text-wa-dark transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Add another group
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="main-form-header text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Send className="w-4 h-4 text-wa-green" /> To: (the who)
          </h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" /> Boss Report Numbers
            </label>
            <div className="space-y-2" id="bossNumberList">
              {config.bossNumbers.map((num, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-wa-gray rounded-lg px-4 py-3 animate-slide-up"
                >
                  <span className="text-sm text-gray-400">+</span>
                  <input
                    type="text"
                    value={num}
                    onChange={(e) => handleUpdateBossNumber(i, e.target.value)}
                    placeholder={i > 0 ? 'Add number...' : undefined}
                    className="bg-transparent border-0 text-sm text-gray-700 flex-1 focus:outline-none boss-number-input"
                  />
                  {i === 0 && num.trim() && (
                    <span className="text-xs text-wa-green font-medium bg-wa-light px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveBossNumber(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 remove-boss-number"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddBossNumber}
              id="addBossNumberBtn"
              className="mt-3 flex items-center gap-2 text-sm font-medium text-wa-green hover:text-wa-dark transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Add another number
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="main-form-header text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-wa-green" /> What to look for?
          </h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" /> Content Info (Keywords)
            </label>
            <div className="flex flex-wrap gap-2 mb-3" id="keywordTags">
              {config.keywords.map((keyword, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-wa-light text-wa-dark text-xs font-medium px-3 py-1.5 rounded-full animate-fade-in"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
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
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                id="keywordInput"
                className="flex-1 bg-wa-gray border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-wa-green focus:outline-none"
              />
              <button
                onClick={handleAddKeyword}
                id="addKeywordBtn"
                className="px-4 py-2.5 bg-wa-green text-white text-sm font-semibold rounded-lg hover:bg-wa-green/90 transition-colors active:scale-95"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" /> Content Types
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'text', label: 'Text' },
                { key: 'audio', label: 'Audio' },
                { key: 'images', label: 'Images' },
                { key: 'documents', label: 'Documents' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.contentTypes[key]}
                    onChange={() => toggleContentType(key)}
                    className="w-4 h-4 rounded border-gray-300 text-wa-green focus:ring-wa-green"
                  />
                  <span className="text-sm text-gray-600">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="main-form-header text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-wa-green" /> When to check and send
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" /> Start From
              </label>
              <input
                type="datetime-local"
                value={config.startTime}
                onChange={(e) => setConfig((prev) => ({ ...prev, startTime: e.target.value }))}
                id="startTimeInput"
                className="w-full bg-wa-gray border-0 rounded-lg px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-wa-green focus:outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-gray-400" /> Time Period (Interval)
              </label>
              <select
                value={config.interval}
                onChange={(e) => setConfig((prev) => ({ ...prev, interval: e.target.value }))}
                id="intervalSelect"
                className="w-full bg-wa-gray border-0 rounded-lg px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-wa-green focus:outline-none cursor-pointer"
              >
                <option value="5">Every 5 minutes</option>
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every 1 hour</option>
                <option value="180">Every 3 hours</option>
                <option value="360">Every 6 hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            id="saveConfigBtn"
            className={`w-full py-3.5 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 ${
              saveState === 'saved'
                ? 'bg-wa-green shadow-wa-green/20'
                : 'bg-wa-dark shadow-wa-dark/20 hover:bg-wa-dark/90'
            }`}
          >
            {saveState === 'saved' ? (
              '✓ Saved!'
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
