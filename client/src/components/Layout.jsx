import { Outlet } from 'react-router'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

//sidebar + top bar + the page that is open
const Layout = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
