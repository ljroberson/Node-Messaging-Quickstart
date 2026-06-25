export function SearchBar() {
  return (
    <div className="border-b border-kik-divider bg-white px-4 py-2">
      <div className="flex items-center rounded-lg bg-kik-grey-bg px-3 py-2">
        <svg
          className="mr-2 text-kik-text-secondary"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <span className="text-[15px] text-kik-text-secondary">Find People</span>
      </div>
    </div>
  )
}
