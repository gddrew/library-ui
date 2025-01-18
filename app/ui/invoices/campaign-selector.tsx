import React, { useState, useEffect } from 'react';
import {
  campaigns as campaignData,
  Campaign,
} from '@/app/ui/invoices/campaignData';
import { BanknotesIcon } from '@heroicons/react/24/outline';

interface CampaignSelectorProps {
  onSelectCampaign: (campaign: string) => void;
  className: string;
  initialCampaign?: string;
  disabled?: boolean;
}

const CampaignSelector: React.FC<CampaignSelectorProps> = ({
  onSelectCampaign,
  className,
  initialCampaign,
  disabled = false,
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    campaignData.filter((campaign) => campaign.active)
  );

  // If there's an initialCampaign not in the list (maybe it's inactive),
  // add it so the user can see it in the dropdown.
  useEffect(() => {
    if (initialCampaign && !campaigns.some((c) => c.name === initialCampaign)) {
      // Add that campaign so it appears in the dropdown
      setCampaigns((prev) => [
        ...prev,
        { name: initialCampaign, active: true },
      ]);
    }
  }, [initialCampaign, campaigns]);

  // If 'initialCampaign' is provided, use that as default selected
  const [selectedCampaign, setSelectedCampaign] = useState<string>(
    initialCampaign || ''
  );

  // Update the parent whenever we change our local selection
  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCampaign(value);
    onSelectCampaign(value);
  };

  return (
    <div>
      {/* Campaign Selector */}
      <div className='relative'>
        <select
          id='campaign'
          name='campaign'
          value={selectedCampaign}
          onChange={handleCampaignChange}
          disabled={disabled}
          className={className}
        >
          <option value=''>Select a campaign</option>
          {campaigns.map((campaign, index) => (
            <option key={index} value={campaign.name}>
              {campaign.name}
            </option>
          ))}
        </select>
        <BanknotesIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500' />
      </div>
    </div>
  );
};

export default CampaignSelector;
