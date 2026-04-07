import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <>
      <style>{`
        .layout-container {
          display: flex;
          min-height: 100vh;
        }
        .layout-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }
        @media (max-width: 768px) {
          .layout-main {
            padding-top: 58px;
          }
        }
      `}</style>
      <div className="layout-container">
        <Sidebar />
        <div className="layout-main">
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;