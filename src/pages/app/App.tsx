import { NavigationRail } from '@components'
import { Outlet } from 'react-router-dom'

const App = () => {
  return (
    <>
      <div className='flex flex-row h-full'>
        <NavigationRail />
        <div className='overflow-auto'>
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default App
export { App }