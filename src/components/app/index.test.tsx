import { render, screen } from '@testing-library/react'

import { AppWithErrorBoundary } from 'components/app'

test('renders learn react link', () => {
  render(<AppWithErrorBoundary />)
  const linkElement = screen.getByText(/learn react/i)
  expect(linkElement).toBeInTheDocument()
})
