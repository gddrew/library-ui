import React, { useState } from 'react';
import { campaigns as campaignData, Campaign } from '@/app/ui/invoices/campaignData'
import { BanknotesIcon } from '@heroicons/react/24/outline';

interface CampaignSelectorProps {
  onSelectCampaign: (campaign: string) => void;
  className: string;
}

const CampaignSelector: React.FC<CampaignSelectorProps> = ({ onSelectCampaign, className }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    campaignData.filter((campaign) => campaign.active)
  );
  const [newCampaign, setNewCampaign] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  const handleAddCampaign = () => {
    if (newCampaign && !campaigns.some((c) => c.name === newCampaign)) {
      const newCampaignEntry = { name: newCampaign, active: true };
      setCampaigns([...campaigns, newCampaignEntry]);
      setSelectedCampaign(newCampaign);
      onSelectCampaign(newCampaign);
      setNewCampaign('');
    }
  };

  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'add_new') {
      setSelectedCampaign('add_new');
    } else {
      setSelectedCampaign(value);
      onSelectCampaign(value);
    }
  };

  return (
    <div>
      {/* Campaign Selector */}
      <div className="relative">
        <select
          id="campaign"
          name="campaign"
          value={selectedCampaign}
          onChange={handleCampaignChange}
          className={className}
        >
          <option value="">Select a campaign</option>
          {campaigns.map((campaign, index) => (
            <option key={index} value={campaign.name}>
              {campaign.name}
            </option>
          ))}
          <option value="add_new">Add a new campaign</option>
        </select>
        <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
      </div>

      {/* Add New Campaign Input */}
      {selectedCampaign === 'add_new' && (
        <div className="mt-2">
          <div className="relative">
            <input
              type="text"
              value={newCampaign}
              onChange={(e) => setNewCampaign(e.target.value)}
              placeholder="Enter new campaign name"
              className="block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCampaign}
            className="mt-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Campaign
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignSelector;
