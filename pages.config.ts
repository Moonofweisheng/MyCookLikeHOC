/*
 * @Author: weisheng
 * @Date: 2025-09-25 21:15:17
 * @LastEditTime: 2025-09-26 10:56:48
 * @LastEditors: weisheng
 * @Description:
 * @FilePath: /cook-cook/pages.config.ts
 * 记得注释
 */
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [
  ],
  globalStyle: {
    // 导航栏配置
    navigationBarTitleText: '像老乡鸡那样做饭',
    // 下拉刷新配置
    enablePullDownRefresh: false,
    onReachBottomDistance: 50,

    // 导航栏配置
    navigationBarBackgroundColor: '#FFF',
    navigationBarTextStyle: 'black',
    // 页面背景配置
    backgroundColor: '#F8F8F8',
    backgroundTextStyle: 'dark',
    backgroundColorTop: '#F8F8F8',
    backgroundColorBottom: '#F8F8F8',

    // 动画配置
    animationType: 'pop-in',
    animationDuration: 300,
  },
  tabBar: {
    custom: true,
    // #ifdef MP-ALIPAY
    customize: true,
    // 暂时不生效。4.71.2025061206-alpha已修复：https://uniapp.dcloud.net.cn/release-note-alpha.html#_4-71-2025061206-alpha，我们等正式版发布后更新。
    overlay: true,
    // #endif
    height: '0',
    list: [{
      pagePath: 'pages/index/index',
    }, {
      pagePath: 'pages/about/index',
    }],
  },
})
