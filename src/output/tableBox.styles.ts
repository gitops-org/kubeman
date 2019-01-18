import { Theme, createStyles } from '@material-ui/core/styles'
import {indigo, blue, red, pink, purple} from '@material-ui/core/colors'

const borderLight = '1px solid #c8c8ea'
const borderDark = '1px solid rgba(255, 255, 255, 0.12)'

const columnSeparatorLight = '1px dotted #3141b4'
const columnSeparatorDark = '1px dotted #4b6082'

const styles = ({ palette, spacing, typography, breakpoints }: Theme) => createStyles({
  root: {
    width: '100%',
    height: '100%',
    padding: 0,
    backgroundColor: palette.type ==='dark' ? palette.background.paper : '#edeef8',
  },
  filterContainer: {
    paddingLeft: 5,
  },
  tableContainer: {
    height: '100%',
    padding: 0,
    paddingLeft: 5,
    margin: 0,
    backgroundColor: palette.type ==='dark' ? palette.background.paper : '#edeef8',
  },
  table: {
    padding: 0,
    paddingLeft: 5,
    backgroundColor: palette.type ==='dark' ? palette.background.paper : '#edeef8',
    wordWrap: 'break-word',
    wordBreak: 'break-all',
  },
  tableBody: {
    width: '100%',
    height: '100%',
    padding: 0,
    margin: 0,
    backgroundColor: palette.type ==='dark' ? palette.background.paper : '#edeef8',
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  tableHeaderRow: {
    padding: 0,
    height: 36,
    backgroundBlendMode: 'multiply',
    background: palette.type ==='dark' ? 
          'linear-gradient(45deg, #4b6082 20%, #4b6082 99%)'
          : 'linear-gradient(45deg, #3141b4 20%, #3141b4 99%)'
  },
  tableHeaderText: {
    color: '#ffffff !important',
  },
  tableGroupRow: {
    padding: 0,
    height: 24,
    backgroundBlendMode: 'multiply',
    color: '#ffffff !important',
    background: 'linear-gradient(45deg, #2952a3 80%, #142952 99%)',
    cursor: 'pointer',
  },
  tableSubgroupRow: {
    padding: 0,
    height: 24,
    backgroundBlendMode: 'multiply',
    backgroundColor: palette.type ==='dark' ? '#455A64' : '#CFD8DC',
  },
  tableRow: {
    padding: 0,
    height: 24,
    backgroundColor: palette.type ==='dark' ? palette.background.paper : '#dee6ed',
    borderBottom: 0,
  },
  tableCellInnerRow: {
    padding: 0,
    height: 24,
    backgroundColor: palette.type ==='dark' ? palette.background.paper : '#dee6ed',
  },
  tableRowSpacer: {
    height: 3,
  },
  tableAppendedRow: {
    backgroundColor: palette.type ==='dark' ? '#806f00' : '#ffdd00',
  },
  tableCell: {
    padding: '0px',
    color: 'inherit',
    verticalAlign: 'top',
    minWidth: 120,
    fontSize: palette.type ==='dark' ? '0.9rem' : '0.87rem',
    [breakpoints.up('sm')]: {
      maxWidth: '200px'
    },
    [breakpoints.up('md')]: {
      maxWidth: '250px'
    },
    [breakpoints.up('lg')]: {
      maxWidth: '300px'
    }
  },
  tableCellCompare: {
    borderRight: palette.type ==='dark' ? columnSeparatorDark : columnSeparatorLight,
  },
  pre: {
    fontSize: '1.1rem',
    display: 'inline-block',
    height: '15px',
  },
  tableKeyCell: {
    backgroundColor: palette.type ==='dark' ? palette.background.default : '#bcccdc',
    width: '22%',
    minWidth: 120,
  },
  tableKeyCellHighlight: {
    '&:after': {
      content: "'*'",
      color: 'red'
    },
  },
  tableCellHighlight: {
    borderLeft: '1px solid red',
    //backgroundColor: palette.type ==='dark' ? "#6c6313" : "#FFFDE7",
  },
  tableCellHealthGood: {
    backgroundColor: palette.type ==='dark' ? '#2E7D32' : '#DCEDC8',
  },
  tableCellHealthBad: {
    backgroundColor: palette.type ==='dark' ? '#805500' : '#ff8000',
  },
  tableCellHidden: {
    padding: 0, 
    textAlign: 'center',
    backgroundColor: palette.type ==='dark' ? palette.background.default : '#bcccdc',
  },
  tableGridCell: {
    '&:not(:last-child)': {
      borderBottom: '1px dashed #808080'
    }
  },
  searchHighlight: {
    backgroundColor: palette.type ==='dark' ? '#804d00' : '#FFCC80',
  },
  grid: {
    
  },
  gridCell: {

  },
  filterInput: {
    fontSize: '0.9rem',
  },
  loading: {
    position: 'absolute',
    top: '60%',
    left: '60%',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: 'transparent',
  },
})

export default styles
