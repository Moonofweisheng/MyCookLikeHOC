<!--
 * @Author: weisheng
 * @Date: 2025-09-02 09:42:36
 * @LastEditTime: 2026-04-08 18:36:24
 * @LastEditors: weisheng
 * @Description:
 * @FilePath: /cook-cook/src/components/GlobalDialog.vue
 * 记得注释
-->
<script lang="ts" setup>
import { deepClone, isFunction } from '@wot-ui/ui/common/util'
import { useDialog } from '@wot-ui/ui'
import { useGlobalDialog } from '@/composables/useGlobalDialog'

const { dialogOptions, currentPage } = storeToRefs(useGlobalDialog())

const dialog = useDialog('globalDialog')
const currentPath = getCurrentPath()

// #ifdef MP-ALIPAY
const hackAlipayVisible = ref(false)

nextTick(() => {
  hackAlipayVisible.value = true
})
// #endif

watch(() => dialogOptions.value, (newVal) => {
  if (newVal) {
    if (currentPage.value === currentPath) {
      const option = deepClone(newVal)
      dialog.show(option).then((res: any) => {
        if (isFunction(option.success)) {
          option.success(res)
        }
      }).catch((err: any) => {
        if (isFunction(option.fail)) {
          option.fail(err)
        }
      })
    }
  }
  else {
    dialog.close()
  }
})
</script>

<script lang="ts">
export default {
  options: {
    virtualHost: true,
    addGlobalClass: true,
    styleIsolation: 'shared',
  },
}
</script>

<template>
  <!-- #ifdef MP-ALIPAY -->
  <wd-dialog v-if="hackAlipayVisible" selector="globalDialog" />
  <!-- #endif -->
  <!-- #ifndef MP-ALIPAY -->
  <wd-dialog selector="globalDialog" />
  <!-- #endif -->
</template>
