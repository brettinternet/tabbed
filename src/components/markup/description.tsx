type DescriptionProps = React.PropsWithChildren<{ id?: string }>

export const Description: React.FC<DescriptionProps> = ({ children, id }) => (
  <p id={id} className="text-gray-600 dark:text-gray-300">
    {children}
  </p>
)
