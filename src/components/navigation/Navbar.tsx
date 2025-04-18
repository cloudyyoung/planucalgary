import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/solid'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { Button } from '@components'

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
}
const navigation = [
  { name: 'Courses', href: '/courses' },
  // { name: 'Programs', href: '/programs' },
  { name: 'Terms', href: '/terms' },
]
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

const Navbar = () => {
  return (
    <>
      <Disclosure as="nav" className="">
        {({ open }) => (
          <>
            <div className="mx-auto px-app mb-2">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-8 w-8"
                      src="/logo.svg"
                      alt="Plan Ucalgary"
                    />
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-baseline">
                      {navigation.map((item) => (
                        <NavLink key={item.name} to={item.href}>
                          {({ isActive }) => (
                            <Button
                              appearance={isActive ? 'tonal' : 'text'}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              {item.name}
                            </Button>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <Button appearance='text'>
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-5 w-5" aria-hidden="true" />
                    </Button>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-1">
                      <div>
                        <Menu.Button>
                          <Button appearance='tonal'>
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">Open user menu</span>
                            <UserIcon className="h-5 w-5" aria-hidden="true" />
                          </Button>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              <a
                                href={item.href}
                                className='block px-4 py-2 text-sm text-secondary hover:bg-secondary-99'
                              >
                                {item.name}
                              </a>
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button>
                    <Button appearance='tonal'>
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-5 w-5" aria-hidden="true" />
                      )}
                    </Button>
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                {navigation.map((item) => (
                  <NavLink key={item.name} to={item.href}>
                    {({ isActive }) => (
                      <Disclosure.Button
                        as="a"
                        className={clsx(
                          isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'block rounded-md px-3 py-2 text-base font-medium'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.name}
                      </Disclosure.Button>
                    )}
                  </NavLink>
                ))}
              </div>
              <div className="border-t border-gray-700 pb-3 pt-4">
                <div className="flex items-center px-5">
                  <div className="">
                    <div className="text-base font-medium leading-none text-primary">{user.name}</div>
                    <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                  </div>
                  <button
                    design="button"
                    className="relative ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </>
  )
}

export default Navbar
export { Navbar }
