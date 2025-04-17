'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarIcon, PillIcon, UserIcon, LogOutIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function PatientNavBar() {
	const pathname = usePathname();

	const navItems = [
		{
			name: 'Appointments',
			href: '/appointments',
			icon: <CalendarIcon className='h-4 w-4 mr-2' />,
		},
		{
			name: 'Medications',
			href: '/medications',
			icon: <PillIcon className='h-4 w-4 mr-2' />,
		},
		{
			name: 'Profile',
			href: '/profile',
			icon: <UserIcon className='h-4 w-4 mr-2' />,
		},
	];

	const handleLogout = () => {
		// Add your logout logic here
		console.log('Logging out...');
	};

	return (
		<nav className='border-b bg-background sticky top-0 z-50'>
			<div className='container flex h-16 items-center justify-between px-4 mx-auto'>
				<div className='flex items-center'>
					<Link href='/' className='font-semibold text-xl mr-8'>
						Patient Portal
					</Link>
					<NavigationMenu>
						<NavigationMenuList>
							{navItems.map((item) => (
								<NavigationMenuItem key={item.name}>
									<Link href={item.href} legacyBehavior passHref>
										<NavigationMenuLink
											className={cn(
												navigationMenuTriggerStyle(),
												'flex items-center',
												pathname === item.href ? 'bg-accent' : ''
											)}
										>
											{item.icon}
											{item.name}
										</NavigationMenuLink>
									</Link>
								</NavigationMenuItem>
							))}
						</NavigationMenuList>
					</NavigationMenu>
				</div>

				<div className='flex items-center gap-4'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Avatar className='cursor-pointer hover:ring-2 hover:ring-primary/20 transition'>
								<AvatarImage src='/avatar-placeholder.png' alt='Patient' />
								<AvatarFallback>JP</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-56'>
							<div className='flex items-center justify-start gap-2 p-2'>
								<div className='flex flex-col space-y-1 leading-none'>
									<p className='font-medium'>John Patient</p>
									<p className='text-sm text-muted-foreground'>
										john.patient@example.com
									</p>
								</div>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link
									href='/profile'
									className='flex items-center cursor-pointer'
								>
									<UserIcon className='mr-2 h-4 w-4' />
									<span>My Profile</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleLogout}
								className='flex items-center cursor-pointer text-destructive focus:text-destructive'
							>
								<LogOutIcon className='mr-2 h-4 w-4' />
								<span>Logout</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</nav>
	);
}

export default PatientNavBar;
