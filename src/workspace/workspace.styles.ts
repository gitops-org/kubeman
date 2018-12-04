import { createStyles, Theme } from '@material-ui/core/styles'

const styles = ({ palette, spacing }: Theme) => createStyles({
  root: {
    padding: spacing.unit,
    backgroundColor: palette.background.default,
    color: palette.primary.main,
    width: '100%',
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  table: {
    verticalAlign: 'top',
    height: '100%',
    border: 0,
  },
  upperRow: {
    verticalAlign: 'top',
    border: 'none',
    height: '20%',
  },
  lowerRow: {
    verticalAlign: 'top',
    border: 'none',
    height: '80%',
  },
  bottomRow: {
    height: '50px !important',
    border: 'none',
    padding: 0,
    margin: 0,
  },
  contextCell: {
    verticalAlign: 'top',
    border: 0,
    padding: 0,
    margin: 0,
    paddingLeft: 5,
    paddingBottom: 5,
  },
  actionCell: {
    verticalAlign: 'top',
    width: '25%',
    height: '100%',
    padding: 0,
    margin: 0,
    paddingLeft: 5,
    border: 0,
    //border: '1px solid black'
  },
  outputCell: {
    verticalAlign: 'top',
    border: 0,
    width: '70%',
    minHeight: 500,
    height: '100%',
    padding: 0,
    margin: 0,
    paddingLeft: 5,
  },
  button: {
    margin: spacing.unit,
  },
  input: {
    display: 'none',
  },
})

export default styles