#!/bin/sh
echo "========================================================================================"
echo "                                      Hexo Debug Menu"
echo " "
echo "                                       by @lei2rock"
echo "========================================================================================"
HexoPath=$(cd "$(dirname "$0")"; pwd)
cd ${HexoPath}
echo " "
printf "\033[32mBlog 根目录："${HexoPath}"\033[0m"
echo " "
echo " "
printf "按回车开始本地预览"
echo " "
echo " "
printf "选择："
read answer
if [ "$answer" == "" ]; then
	echo " "
	printf "\033[32mINFO \033[0m 启动本地预览...\n"
	echo " "
#	sed -i "" '41s/imageLink/imageLink.replace(\/\![0-9]{3,}x\/,"")/' node_modules/hexo-theme-next/source/js/utils.js
	hexo s
	hexo clean
#	sed -i "" '41s/.replace(\/\!\[0-9\]{3,}x\/,\"\")//' node_modules/hexo-theme-next/source/js/utils.js
	echo " "
	exec ${HexoPath}/hexo.sh
else
	echo " "
	printf "\033[31mERROR \033[0m 输入错误，请返回重新选择...\n"
	sleep 1s
	echo " "
	exec ${HexoPath}/hexo.sh
fi