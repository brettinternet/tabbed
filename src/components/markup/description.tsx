export const Description: React.FC<{ id?: string }> = ({ children, id }) => (
  <p id={id} className="text-gray-600 dark:text-gray-300">
    {children}
  </p>
)
