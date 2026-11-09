import { Pagination } from 'react-bootstrap'

//"Showing 1 to 5 of 128 entries" + page buttons
const Pager = ({ total, page, setPage, perPage = 5 }) => {
  const pages = Math.max(1, Math.ceil(total / perPage))
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pager">
      <small className="text-muted">
        Showing {from} to {to} of {total} entries
      </small>
      <Pagination size="sm" className="mb-0">
        <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <Pagination.Item key={n} active={n === page} onClick={() => setPage(n)}>
            {n}
          </Pagination.Item>
        ))}
        <Pagination.Next disabled={page === pages} onClick={() => setPage(page + 1)} />
      </Pagination>
    </div>
  )
}

export default Pager
