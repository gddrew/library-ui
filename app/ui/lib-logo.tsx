import { BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function LibLogo({ size = 'large' }: { size?: 'large' | 'small' }) {
  const iconSize = size === 'large' ? 'h-14 w-14' : 'h-10 w-10';
  const textSize = size === 'large' ? 'text-[50px]' : 'text-[30px]';
  const iconAdjustment = size === 'large' ? '-translate-y-[4px]' : '-translate-y-[1px]';

    return (
        <div className={`${lusitana.className} flex flex-row items-end leading-none text-white`}>
            <BuildingLibraryIcon className={`${iconSize} ${iconAdjustment}`} />
            <p className={`${textSize} ml-3`}>Ex Libris</p>
        </div>
    );
}