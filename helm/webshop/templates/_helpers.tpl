{{- define "webshop-frontend.name" -}}
{{ .Chart.Name }}
{{- end }}

{{- define "webshop-frontend.fullname" -}}
{{ .Release.Name }}-{{ include "webshop-frontend.name" . }}
{{- end }}
