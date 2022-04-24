#!/bin/sh
clear

HexoPath=$(cd "$(dirname "$0")"; pwd)
cd ${HexoPath}

hexo_server(){
	open_url(){
		sleep 1.5
		open http://127.0.0.1:4000/
	}
    open_url &
    hexo server
	hexo clean
}

hexo() {
    node --no-warnings node_modules/hexo/bin/hexo "$@"
}

echo '==================== Hexo Utilities ===================='
printf "常用:\n"
printf "  \033[1m\033[32m%s\033[0m %s \t %s \n" 'u' '(yarn upgrade)' '更新依赖包'
printf "  \033[1m\033[32m%s\033[0m %s \t %s \n" 's' '(hexo server)' '预览并打开浏览器'
printf "\n默认回车：只加载预览不打开浏览器\n"
printf "\n\033[32mHexo 根目录："${HexoPath}"\033[0m\n"
echo '--------------------------------------------------------'
printf "\n选择："
read answer

if [ "$answer" == "" ] || [ "$answer" == "s" ]; then
	printf "\n\033[32mINFO \033[0m 启动本地预览...\n"
	echo " "
	if [ "$answer" == "" ]; then
		hexo server
		hexo clean
	else
		hexo_server
	fi
	echo " "
	exec ${HexoPath}/hexo.sh
else
	if [ "$answer" == "u" ]; then
		printf "\n\033[32mINFO \033[0m 开始更新依赖包...\n"
		npm update --no-audit
		exec ${HexoPath}/hexo.sh
	else
		printf "\n\033[31mERROR \033[0m 输入错误，请返回重新选择...\n"
		sleep 1s
		exec ${HexoPath}/hexo.sh
	fi
fi