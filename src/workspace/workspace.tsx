import React from "react";
import { withStyles, WithStyles } from '@material-ui/core/styles'
import { Table, TableBody, TableRow, TableCell, CircularProgress } from "@material-ui/core";
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import StyledActions, {Actions} from '../actions/actions'
import ActionChoiceDialog from '../actions/actionChoiceDialog'
import ContextPanel from '../context/contextPanel'
import ContextSelector from '../context/contextSelector'
import Context from "../context/contextStore";
import BlackBox from '../output/blackbox'
import TableOutput, {TableBox} from '../output/tableBox'
import {ActionOutput, ActionOutputStyle, ActionOutputCollector, ActionStreamOutputCollector,
        ActionChoiceMaker, ActionChoices, BoundActionAct, BoundAction} from '../actions/actionSpec'

import styles from './workspace.styles'

interface IState {
  context: Context
  output: ActionOutput|string[]
  outputStyle: ActionOutputStyle
  loading: boolean
  showChoices: boolean
  minChoices: number
  maxChoices: number
  choiceTitle: string
  choices: any[]
  scrollMode: boolean
  deferredAction?: BoundActionAct
}

interface IProps extends WithStyles<typeof styles> {
  onChangeTheme: (boolean) => void
}
interface IRefs {
  [k: string]: any
  contextSelector: ContextSelector|undefined
}

export class Workspace extends React.Component<IProps, IState, IRefs> {
  refs: IRefs = {
    terminal: undefined,
    contextSelector: undefined,
  }
  state: IState = {
    context: new Context,
    output: [],
    outputStyle: ActionOutputStyle.Table,
    loading: false,
    showChoices: false,
    minChoices: 0,
    maxChoices: 0,
    choiceTitle: '',
    choices: [],
    scrollMode: false,
  }
  commandHandler?: ((string) => void) = undefined
  tableBox?: TableBox
  actions?: Actions
  streamOutput: ActionOutput = []

  componentDidMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(props: IProps) {
  }

  registerCommandHandler(commandHandler: (string) => void) {
    this.commandHandler = commandHandler
  }

  onCommand = (command: string) => {
    this.commandHandler && this.commandHandler(command)
  }

  onAction = (action: BoundAction) => {
    this.setState({scrollMode: false})
  }

  showOutputLoading = (loading: boolean) => {
    this.tableBox && this.tableBox.showLoading(loading)
  }

  showOutput : ActionOutputCollector = (output, outputStyle) => {
    this.streamOutput = []
    this.setState({
      output,
      outputStyle: outputStyle || ActionOutputStyle.Text, 
      loading: false,
    })
  }

  showStreamOutput : ActionStreamOutputCollector = (output) => {
    this.streamOutput = this.streamOutput.concat(output)
    this.tableBox && this.tableBox.appendOutput(output as ActionOutput)
  }

  setScrollMode = (scrollMode: boolean) => {
    this.setState({scrollMode})
  }

  showChoices : ActionChoiceMaker = (act, title, choices, minChoices, maxChoices) => {
    this.setState({
      choices,
      minChoices,
      maxChoices,
      choiceTitle: title, 
      showChoices: true,
      deferredAction: act,
    })
  }

  onSelectActionChoice = (selections: ActionChoices) => {
    const {context, deferredAction} = this.state
    context.selections = selections
    this.setState({showChoices: false})
    deferredAction && deferredAction()
  }

  onCancelActionChoice = () => {
    this.setState({showChoices: false, loading: false})
  }

  onActionTextInput = (text: string) => {
    this.actions && this.actions.onActionTextInput(text)
  }

  showLoading = () => {
    this.tableBox && this.tableBox.clearFilter()
    this.setState({loading: true, outputStyle: ActionOutputStyle.None})
  }

  onUpdateContext = (context: Context) => {
    this.setState({context: context})
  }

  onKeyPress(event: KeyboardEvent) {
    const { contextSelector } = this.refs
    contextSelector && contextSelector.onKeyPress(event)
  }

  onSelectCluster() {
    const { contextSelector } = this.refs
    contextSelector && contextSelector.selectClusters()
  }

  render() {
    const { classes } = this.props;
    const { context, output, outputStyle, loading, scrollMode,
      showChoices, minChoices, maxChoices, choiceTitle, choices } = this.state;

    const showBlackBox = outputStyle === ActionOutputStyle.Text
    const log = outputStyle === ActionOutputStyle.Log
    const health = outputStyle === ActionOutputStyle.TableWithHealth
    const compare = outputStyle === ActionOutputStyle.Compare
    const showTable = outputStyle === ActionOutputStyle.Table || log || health || compare
    const acceptInput = this.actions && this.actions.acceptInput() ? true : false
    const accumulatedOutput = (output as any[]).concat(this.streamOutput)

    return (
      <div className={classes.root} 
            tabIndex={0}
            //onKeyPress={this.onKeyPress.bind(this)}
      >
        <Table className={classes.table}>
          <TableBody>
            <TableRow className={classes.upperRow}>
              <TableCell colSpan={2} className={classes.contextCell}>
                <ContextPanel context={context} 
                    onUpdateContext={this.onUpdateContext}
                    onSelectContext={this.onSelectCluster.bind(this)} />
              </TableCell>
            </TableRow>
            <TableRow className={classes.lowerRow}>
              <TableCell className={classes.actionCell}>
                <StyledActions innerRef={ref => this.actions=ref}
                        context={context}
                        showLoading={this.showLoading}
                        onCommand={this.onCommand}
                        onOutput={this.showOutput}
                        onStreamOutput={this.showStreamOutput}
                        onChoices={this.showChoices}
                        onSetScrollMode={this.setScrollMode}
                        onAction={this.onAction}
                        onOutputLoading={this.showOutputLoading}
                        />
              </TableCell>
              <TableCell className={classes.outputCell}>
                {loading && <CircularProgress className={classes.loading} />}
                {showBlackBox && <BlackBox output={output} />}
                {showTable && 
                    <TableOutput  innerRef={ref => this.tableBox=ref}
                                  output={accumulatedOutput}
                                  compare={compare} 
                                  log={log}
                                  health={health}
                                  acceptInput={acceptInput}
                                  scrollMode={scrollMode}
                                  onActionTextInput={this.onActionTextInput}
                    />
                }
              </TableCell>
            </TableRow>
            <TableRow className={classes.bottomRow}>
              <TableCell className={classes.bottomRow}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={global['useDarkTheme']}
                      onChange={this.props.onChangeTheme}
                      value="Dark"
                    />
                  }
                  label="Dark Theme"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <ContextSelector ref='contextSelector'
            context={context} 
            onUpdateContext={this.onUpdateContext.bind(this)} />
        {
          showChoices && 
          <ActionChoiceDialog
            open={showChoices}
            title={choiceTitle}
            choices={choices}
            minChoices={minChoices}
            maxChoices={maxChoices}
            onSelection={this.onSelectActionChoice}
            onCancel={this.onCancelActionChoice}
          />
        }
      </div>
    );
  }
}

export default withStyles(styles)(Workspace)