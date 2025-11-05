# docker-bake.hcl

###############################################
# Variables
###############################################

variable "REGISTRY" { default = "ghcr.io" }
variable "GIT_URL" { default = "github.com" }
variable "ORG" { default = "calme25" }
variable "REPOSITORY" { default = "calme" }
variable "IMAGE_TITLE" { default = "calme" }
variable "TAGS" { default = ["latest"] }

variable "DEFAULT_PLATFORMS" { default = ["linux/amd64,linux/arm64"] }

variable "OCI_LABELS" {
  type = map(string)
  default = {
    "org.opencontainers.image.description" = "CALMe PWA - Cognitive-Affective Learning Model"
    "org.opencontainers.image.authors"     = "calme25"
    "org.opencontainers.image.source"      = "https://github.com/calme25/calme.git"
    "org.opencontainers.image.title"       = "calme"
    "org.opencontainers.image.url"         = "https://ghcr.io/calme25/calme"
  }
}

######################
# Build targets      #
######################

target "docker-metadata-action" {}

target "base" {
  inherits = ["docker-metadata-action"]

  context    = "."
  dockerfile = "Dockerfile"

  output = [{ type = "cacheonly" }]

  # Final server stage
  target = "server"

  # Pass all version/build args through (populated by `docker-bake.override.hcl`)
  args = {
    NODE_VERSION  = "${node}"
    NODE_TAG      = "${node_tag}"
    NGINX_VERSION = "${nginx}"
    NGINX_TAG     = "${nginx_tag}"
    NGINX_USER    = "${nginx_user}"
    NGINX_GROUP   = "${nginx_group}"
    NGINX_UID     = "${nginx_uid}"
    NGINX_GID     = "${nginx_gid}"
  }

  tags = [
    "${REGISTRY}/${ORG}/${IMAGE_TITLE}:latest",
  ]

  # Same map drives both places – no duplication
  labels = OCI_LABELS

  # Turn the map into the list of strings bake expects
  annotations = [
    for k, v in OCI_LABELS : "manifest:${k}=${v}"
  ]
}

target "multiarch-push" {
  inherits = ["base"]

  output    = [{ type = "registry" }]
  platforms = "${DEFAULT_PLATFORMS}"

  attest = [
    "type=provenance,mode=max",
    "type=sbom",
  ]

  # Add index annotations for multi platform export
  annotations = [
    for k, v in OCI_LABELS : "index,manifest:${k}=${v}"
  ]
}

# Single‑arch build into local daemon
target "local" {
  inherits = ["base"]

  output    = [{ type = "docker" }]
  platforms = ["${BAKE_LOCAL_PLATFORM}"]

  tags = [
    "${IMAGE_TITLE}:latest",
  ]
}

# Development build with builder stage only
target "dev" {
  inherits = ["base"]

  # Override to use builder stage for development
  target = "builder"

  output    = [{ type = "docker" }]
  platforms = ["${BAKE_LOCAL_PLATFORM}"]

  tags = [
    "${IMAGE_TITLE}:dev",
  ]
}

######################
# Convenience groups #
######################

group "default" { targets = ["local"] }
group "local" { targets = ["local"] }
group "push" { targets = ["multiarch-push"] }
group "dev" { targets = ["dev"] }
