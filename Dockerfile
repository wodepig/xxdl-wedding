FROM node:18.18.2-alpine3.18
MAINTAINER xxdl.xyz
WORKDIR /app
COPY .output .output
EXPOSE 3000
#If the environment in China build please open the following comments
#如果在中国环境下构建请把下面注释打开
CMD ["node", ".output/server/index.mjs"]