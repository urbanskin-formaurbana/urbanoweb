# Image used by the `supertokens-postgres-restore` compose service.
# Bundles psql/pg_isready (postgresql-client) with the AWS CLI so a single
# container can pull the latest SuperTokens Postgres backup from S3 and
# replay it into the local `supertokens-postgres` service.

FROM alpine:3.20

RUN apk add --no-cache aws-cli postgresql-client bash jq gzip

WORKDIR /work
COPY --chmod=755 restore.sh /work/restore.sh

ENTRYPOINT ["/work/restore.sh"]
