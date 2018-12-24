import _ from 'lodash'
import {DataObject, StringStringArrayMap, GetItemsFunction} from '../../src/k8s/k8sFunctions'
import ActionContext from '../../src/actions/actionContext'
import {ActionOutput} from '../../src/actions/actionSpec'
import {Namespace, Pod, PodTemplate, PodDetails, PodContainerDetails} from "../../src/k8s/k8sObjectTypes"
import k8sFunctions from '../../src/k8s/k8sFunctions'
import { K8sClient } from '../../src/k8s/k8sClient'

export interface PodSelection {
  title: string
  container: string
  pod: string
  podContainerDetails?: PodContainerDetails
  namespace: string
  cluster: string
  k8sClient: K8sClient
}

export default class K8sPluginHelper {
  static items: StringStringArrayMap = {}

  private static async storeItems(actionContext: ActionContext, getItems: GetItemsFunction, ...fields) {
    const clusters = actionContext.getClusters()
    const k8sClients = actionContext.getK8sClients()
    const namespaces = actionContext.getNamespaces()
    this.items = {}
    const choices: any[] = []
    for(const i in namespaces) {
      const namespace = namespaces[i]
      const nsCluster = namespace.cluster.name
      if(!this.items[nsCluster]) {
        this.items[nsCluster] = {}
      }
      if(!this.items[nsCluster][namespace.name]) {
        this.items[nsCluster][namespace.name] = []
      }

      const k8sClient = clusters.map((c,i) => c.name === nsCluster ? i : -1)
                                .filter(i => i >= 0).map(i => k8sClients[i])[0]
      
      const items = this.items[nsCluster][namespace.name] = await getItems(nsCluster, namespace.name, k8sClient)
      items.forEach(item => {
        const choiceItem: any[] = []
        if(fields.length > 0) {
          fields.forEach(field => choiceItem.push(item[field]))
        } else {
          choiceItem.push(item)
        }
        choiceItem.push("Namespace: " + namespace.name)
        choiceItem.push("Cluster: " + nsCluster)
        choices.push(choiceItem)
      })
    }
    return choices
  }

  static async prepareChoices(actionContext: ActionContext, 
                                    k8sFunction: GetItemsFunction, 
                                    name: string, min: number, max: number, ...fields) {
    
    const choices: any[] = await K8sPluginHelper.storeItems(actionContext, k8sFunction, fields)
    let howMany = ""
    if(min === max && max > 0) {
      howMany = " " + max + " "
    } else {
      howMany = min > 0 ? " at least " + min + " " : ""
      howMany += max > 0 && min > 0 ? ", and " : ""
      howMany += max > 0 ?  " up to " + max + " " : ""
    }
    actionContext.onChoices && actionContext.onChoices("Choose" + howMany + name, choices, min, max)
  }

  static async generateComparisonOutput(actionContext, name, ...fields) {
    let selections = actionContext.getSelections()
    if(selections.length < 2) {
      actionContext.onOutput(["No " + name + " selected"], 'Text')
      return
    }
    selections = selections.map(selection => {
      const data: DataObject = {}
      let lastIndex = 0
      if(fields.length > 0) {
        fields.forEach((field, index) => {
          data[field] = selection[index]
          lastIndex++
        })
      } else {
        data.name = selection[0]
        lastIndex++
      }
      data.namespace = selection[lastIndex].replace("Namespace: ", "")
      data.cluster = selection[lastIndex+1].replace("Cluster: ", "")
      return data
    })
    let output: ActionOutput = []
    const outputHeaders = ["Keys"]
    const outputRows: ActionOutput = []
    outputRows.push(["Cluster"])
    outputRows.push(["Namespace"])

    const firstItem = K8sPluginHelper.items[selections[0].cluster][selections[0].namespace][0]
    const outputKeys = typeof firstItem !== 'string' ? Object.keys(firstItem) : []
    outputKeys.forEach(key => outputRows.push([key]))

    selections.forEach(selection =>
      K8sPluginHelper.items[selection.cluster][selection.namespace]
        .filter(item => (item.name || item) === selection.name)
        .forEach(item => {
          outputHeaders.push(item.name || item)
          outputRows[0].push(selection.cluster||'')
          outputRows[1].push(selection.namespace||'')
          if(typeof item !== 'string') {
            outputKeys.forEach((key, index) => outputRows[index+2].push(item[key] ||''))
          }
        }))
    outputRows.forEach((row,i) => {
      const hasAnyValue = row.slice(1).map(value => value && value !== '')
                                .reduce((r1,r2) => r1 || r2, false)
      if(!hasAnyValue) {
        delete outputRows[i]
      }
    })
    output.push(outputHeaders)
    output = output.concat(outputRows)
    actionContext.onOutput(output, "Compare")
  }

  static async choosePod(min: number = 1, max: number = 1, chooseContainers: boolean = false, actionContext: ActionContext) {
    const contextPods = actionContext.getPods()
    const containers = _.flatMap(contextPods, pod => pod.containers)
    const contextHasLess = chooseContainers ? containers.length < min : contextPods.length < min
    const contextHasMore = chooseContainers ? containers.length > max : contextPods.length > max
    if(contextHasLess || contextHasMore) {
      K8sPluginHelper.prepareChoices(actionContext, 
        async (cluster, namespace, k8sClient) => {
          let pods : any[] = []
          if(contextHasLess) {
            pods = await k8sFunctions.getAllPodsForNamespace(namespace, k8sClient)
          } else {
            const namespaces = actionContext.getNamespaces()
            pods = _.flatMap(
                    namespaces.filter(ns => ns.cluster.name === cluster && ns.name === namespace),
                    ns => ns.pods)
          }
          if(chooseContainers) {
            pods = _.flatMap(pods, pod => pod.containers.map(c => {
              return {
                ...pod,
                name: (c.name ? c.name : c)+"@"+pod.name,
              }
            }))
          }
          return pods
        },
        chooseContainers ? "Container@Pod" : "Pod(s)", min, max, "name"
      )
    } else {
      const selections = await K8sPluginHelper.storeItems(actionContext, (clusterName, nsName) => {
        const cluster = actionContext.context && actionContext.context.cluster(clusterName)
        const namespace = cluster && cluster.namespace(nsName)
        let pods = namespace ? namespace.pods : []
        if(chooseContainers) {
          pods = _.flatMap(pods, pod => pod.containers.map(c => {
            return {
              ...pod,
              name: c+"@"+pod.name,
            }
          }))
        }
        return Promise.resolve(pods)
      })
      actionContext.context && (actionContext.context.selections = selections)
      actionContext.onSkipChoices && actionContext.onSkipChoices()
    }
  }

  static async getPodSelections(actionContext: ActionContext, loadDetails: boolean = false) {
    const selections = actionContext.getSelections()
    const pods : PodSelection[] = []
    for(const i in selections) {
      const selection = selections[i]
      const namespace = selection[1].replace("Namespace: ", "")
      const cluster = selection[2].replace("Cluster: ", "")
      const clusters = actionContext.getClusters()
      const clusterIndex = clusters.map((c,i) => c.name === cluster ? i : -1)
              .filter(i => i >= 0)[0]
      const k8sClient = actionContext.getK8sClients()[clusterIndex]
      const title = selection[0].name ? selection[0].name : selection[0] as string
      const podAndContainer = title.split("@")
      const container = podAndContainer[0]
      const pod = podAndContainer[1]
      const podContainerDetails : PodContainerDetails|undefined = loadDetails ? await k8sFunctions.getContainerDetails(namespace, pod, container, k8sClient) : undefined
      pods.push({
        title,
        container,
        pod,
        podContainerDetails,
        namespace,
        cluster,
        k8sClient
      })
    }
    return pods
  }
}