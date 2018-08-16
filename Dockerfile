FROM registry.cn-hangzhou.aliyuncs.com/choerodon-tools/frontbase:0.5.0

ENV PRO_API_HOST gateway.choerodon.com.cn
ENV PRO_DEVOPS_HOST localhost:8060
ENV PRO_CLIENT_ID devops
ENV PRO_LOCAL true
ENV PRO_TITLE_NAME Choerodon
ENV PRO_HEADER_TITLE_NAME Choerodon
ENV PRO_COOKIE_SERVER choerodon.com.cn
ENV PRO_HTTP http
ENV PRO_FILE_SERVER choerodon.com.cn

RUN echo "Asia/shanghai" > /etc/timezone;
ADD dist /usr/share/nginx/html
COPY devops-structure/devops-enterpoint.sh /usr/share/nginx/html
COPY config.yml /usr/share/nginx/html
COPY dashboard.yml /usr/share/nginx/html
COPY structure/sql.py /usr/share/nginx/html
COPY structure/dashboard.py /usr/share/nginx/html
COPY devops-structure/deleteMenu.py /usr/share/nginx/html
RUN chmod 777 /usr/share/nginx/html/devops-enterpoint.sh
ENTRYPOINT ["/usr/share/nginx/html/devops-enterpoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80
