import eventBus from '@/util/eventBus'
import div from '@/components/Dom'

import('./vueMain.js').then(_ => {
  eventBus.emit('mounted', div)
})
