import { Outlet } from 'react-router-dom'

export const App = () => {
  return (
    <>
      <div className='fixed top-0 left-0 right-0 bottom-0 overflow-auto'>
        <Outlet />
      </div>
    </>
  )
}
