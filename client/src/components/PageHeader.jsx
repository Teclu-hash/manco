//title + subtitle on the left, action button on the right
const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
      <div>
        <h2 className="page-title">{title}</h2>
        <p className="page-subtitle mb-0">{subtitle}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

export default PageHeader
