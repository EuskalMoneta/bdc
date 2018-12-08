FROM python:3.5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./src/bdc/ /usr/src/app/
RUN pip install --no-cache-dir -r requirements.txt


# This apt-get thing is from the now deprecated django docker image
RUN apt-get update && apt-get install -y \
    gcc \
    gettext \
    mysql-client default-libmysqlclient-dev \
    postgresql-client libpq-dev \
    sqlite3 \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Installing node / npm in Debian (following official nodejs Dockerfile https://github.com/nodejs/docker-node):

# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in gpg_keys/* ; do \
    gpg --import ${key}; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 6.9.1

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Install of nodejs / npm is ok now, we can install our dependencies
RUN npm install \
  && npm run build

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
