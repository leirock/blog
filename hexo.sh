#!/bin/sh
clear

HexoPath=$(cd "$(dirname "$0")"; pwd)
cd ${HexoPath}

hexo_server(){
	open_url(){
		sleep 2
		open http://localhost:4000/
	}
    open_url &
    find . -name '*.DS_Store' -type f -delete && hexo server
	hexo clean
}

echo '====================== Hexo Tools ======================'
printf "命令:\n"
printf "  \x1B[32m%s\x1B[0m %s \t %s \n" 'u' '(npm update)' '更新依赖包'
printf "  \x1B[32m%s\x1B[0m %s \t %s \n" 's' '(hexo server)' '预览并打开浏览器'
printf "\n\x1B[32m所在目录：\x1B[0m"${HexoPath}"\n"
echo '--------------------------------------------------------'
printf "\n选择(默认只预览不打开浏览器)："
read answer

if [ "$answer" == "" ] || [ "$answer" == "s" ]; then
	printf "\n\x1B[32mINFO \x1B[0m 启动本地预览...\n"
	echo " "
	if [ "$answer" == "" ]; then
		find . -name '*.DS_Store' -type f -delete && hexo server
		hexo clean
	else
		hexo_server
	fi
	echo " "
	exec ${HexoPath}/hexo.sh
else
	if [ "$answer" == "u" ]; then
		printf "\n\x1B[32mINFO \x1B[0m 开始更新依赖包...\n"
		npm update # --no-audit
		exec ${HexoPath}/hexo.sh
	else
		printf "\n\x1B[31mERROR \x1B[0m 输入错误，请返回重新选择...\n"
		sleep 1
		exec ${HexoPath}/hexo.sh
	fi
fi