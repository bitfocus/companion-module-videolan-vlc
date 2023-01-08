import { combineRgb } from '@companion-module/base'

const ICON_PLAY_INACTIVE =
	'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAABJmlDQ1BBZG9iZSBSR0IgKDE5OTgpAAAoz2NgYDJwdHFyZRJgYMjNKykKcndSiIiMUmA/z8DGwMwABonJxQWOAQE+IHZefl4qAwb4do2BEURf1gWZxUAa4EouKCoB0n+A2CgltTiZgYHRAMjOLi8pAIozzgGyRZKywewNIHZRSJAzkH0EyOZLh7CvgNhJEPYTELsI6Akg+wtIfTqYzcQBNgfClgGxS1IrQPYyOOcXVBZlpmeUKBhaWloqOKbkJ6UqBFcWl6TmFit45iXnFxXkFyWWpKYA1ULcBwaCEIWgENMAarTQZKAyAMUDhPU5EBy+jGJnEGIIkFxaVAZlMjIZE+YjzJgjwcDgv5SBgeUPQsykl4FhgQ4DA/9UhJiaIQODgD4Dw745AMDGT/0ZOjZcAAAACXBIWXMAAAsTAAALEwEAmpwYAAAMKmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wNi0wNFQwMDowNzoyNSswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNi0wNFQxMToyMTo0NSswMjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDYtMDRUMTE6MjE6NDUrMDI6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjRmZWVhMGMzLTU1NjQtNDBkNi04NTFhLTJhOThmYjY3OTQ3ZSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjJlOGYwNzIzLTJmNTktOWY0Ny1hNDA0LTBhYTk5MmI4OTA5MiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmNlZDYyMWNiLTU3MmItNGMyZS1hYTU4LTUwYTJiN2YwYzNjZCIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkFkb2JlIFJHQiAoMTk5OCkiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmNlZDYyMWNiLTU3MmItNGMyZS1hYTU4LTUwYTJiN2YwYzNjZCIgc3RFdnQ6d2hlbj0iMjAxOC0wNi0wNFQwMDowNzoyNSswMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphMzAxMDE1Mi1mNDc5LTQzMmItYjdlYi1iZmYxOGU4ZWZlN2IiIHN0RXZ0OndoZW49IjIwMTgtMDYtMDRUMTE6MjE6NDUrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NGZlZWEwYzMtNTU2NC00MGQ2LTg1MWEtMmE5OGZiNjc5NDdlIiBzdEV2dDp3aGVuPSIyMDE4LTA2LTA0VDExOjIxOjQ1KzAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmEzMDEwMTUyLWY0NzktNDMyYi1iN2ViLWJmZjE4ZThlZmU3YiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpjZWQ2MjFjYi01NzJiLTRjMmUtYWE1OC01MGEyYjdmMGMzY2QiIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjZWQ2MjFjYi01NzJiLTRjMmUtYWE1OC01MGEyYjdmMGMzY2QiLz4gPHBob3Rvc2hvcDpUZXh0TGF5ZXJzPiA8cmRmOkJhZz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJSZWMgV2hpdGUiIHBob3Rvc2hvcDpMYXllclRleHQ9Ij0iLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJSZWMgcmVkIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI9Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iU2tpcCBCYWNrIFdoaXRlIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI5Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iU2tpcCBCYWNrIEJsdWUiIHBob3Rvc2hvcDpMYXllclRleHQ9IjkiLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJTa2lwIEZ3ZCB3aGl0ZSIgcGhvdG9zaG9wOkxheWVyVGV4dD0iOiIvPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9IlNraXAgRndkIEJsdWUiIHBob3Rvc2hvcDpMYXllclRleHQ9IjoiLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJQbGF5IFdoaXRlIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI0Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iUGxheSBHcmVlbiIgcGhvdG9zaG9wOkxheWVyVGV4dD0iNCIvPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9IlBhdXNlIFdoaXRlIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI7Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iUGF1c2UgWWVsbG93IiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI7Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iU3RvcCBXaGl0ZSIgcGhvdG9zaG9wOkxheWVyVGV4dD0iJmx0OyIvPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9IlN0b3AgUmVkIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSImbHQ7Ii8+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6VGV4dExheWVycz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6vUl74AAAA8ElEQVR42u3bSw3CQBQF0FqoBSxgAQu1gIVawAIWagELSAALWHgMTbtownwIK8ghuRu6IDkJc9uZ1y4iOskHAiBAgAABWn7s1o0p/ea7Lz//BnRJuafsAOWBIuWRcgCUB1ozACoDxbwuASoCvTIBKgPFcq0HlAeKteEAlTM3HKB6BkD1jIDqmQDVc801HKBtw+0BfdhwgN7nCKieE6CGhgPU2HCAGhoOUEPDAWpoOEANDQeonDMgfzGLtJp3o+hRw8Oq7Q4bZrZcAdm0d+zj4NDRs+EF4y8GqIzgGeI0BgzIILlXEbzMIoAAAQIE6DfyBIZxyJlmS8HgAAAAAElFTkSuQmCC'
const ICON_PAUSE_INACTIVE =
	'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAABJmlDQ1BBZG9iZSBSR0IgKDE5OTgpAAAoz2NgYDJwdHFyZRJgYMjNKykKcndSiIiMUmA/z8DGwMwABonJxQWOAQE+IHZefl4qAwb4do2BEURf1gWZxUAa4EouKCoB0n+A2CgltTiZgYHRAMjOLi8pAIozzgGyRZKywewNIHZRSJAzkH0EyOZLh7CvgNhJEPYTELsI6Akg+wtIfTqYzcQBNgfClgGxS1IrQPYyOOcXVBZlpmeUKBhaWloqOKbkJ6UqBFcWl6TmFit45iXnFxXkFyWWpKYA1ULcBwaCEIWgENMAarTQZKAyAMUDhPU5EBy+jGJnEGIIkFxaVAZlMjIZE+YjzJgjwcDgv5SBgeUPQsykl4FhgQ4DA/9UhJiaIQODgD4Dw745AMDGT/0ZOjZcAAAACXBIWXMAAAsTAAALEwEAmpwYAAAMKmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wNi0wNFQwMDowNzoyNSswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNi0wNFQxMToyMjoxOSswMjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDYtMDRUMTE6MjI6MTkrMDI6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmRkZDAxZWNjLTZjMzItNGZjMi04YzgxLTMwM2Y2Y2M5MzVhNCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjEwOTEyZDk3LWI1MWEtOWI0Ny05YWRkLWQ0MGNmM2Y0NDFkYyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmNlZDYyMWNiLTU3MmItNGMyZS1hYTU4LTUwYTJiN2YwYzNjZCIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkFkb2JlIFJHQiAoMTk5OCkiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmNlZDYyMWNiLTU3MmItNGMyZS1hYTU4LTUwYTJiN2YwYzNjZCIgc3RFdnQ6d2hlbj0iMjAxOC0wNi0wNFQwMDowNzoyNSswMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplOGIyZmYzNC0xNmFmLTQ5MzItYjE1Yy1kMmZlNDE3Y2EyOTkiIHN0RXZ0OndoZW49IjIwMTgtMDYtMDRUMTE6MjI6MTkrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZGRkMDFlY2MtNmMzMi00ZmMyLThjODEtMzAzZjZjYzkzNWE0IiBzdEV2dDp3aGVuPSIyMDE4LTA2LTA0VDExOjIyOjE5KzAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmU4YjJmZjM0LTE2YWYtNDkzMi1iMTVjLWQyZmU0MTdjYTI5OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpjZWQ2MjFjYi01NzJiLTRjMmUtYWE1OC01MGEyYjdmMGMzY2QiIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjZWQ2MjFjYi01NzJiLTRjMmUtYWE1OC01MGEyYjdmMGMzY2QiLz4gPHBob3Rvc2hvcDpUZXh0TGF5ZXJzPiA8cmRmOkJhZz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJSZWMgV2hpdGUiIHBob3Rvc2hvcDpMYXllclRleHQ9Ij0iLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJSZWMgcmVkIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI9Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iU2tpcCBCYWNrIFdoaXRlIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI5Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iU2tpcCBCYWNrIEJsdWUiIHBob3Rvc2hvcDpMYXllclRleHQ9IjkiLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJTa2lwIEZ3ZCB3aGl0ZSIgcGhvdG9zaG9wOkxheWVyVGV4dD0iOiIvPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9IlNraXAgRndkIEJsdWUiIHBob3Rvc2hvcDpMYXllclRleHQ9IjoiLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJQbGF5IFdoaXRlIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI0Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iUGxheSBHcmVlbiIgcGhvdG9zaG9wOkxheWVyVGV4dD0iNCIvPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9IlBhdXNlIFdoaXRlIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI7Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iUGF1c2UgWWVsbG93IiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI7Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iU3RvcCBXaGl0ZSIgcGhvdG9zaG9wOkxheWVyVGV4dD0iJmx0OyIvPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9IlN0b3AgUmVkIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSImbHQ7Ii8+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6VGV4dExheWVycz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4GJG/aAAAAeElEQVR42u3aMQ0AIAxFwarFE94QgYOCAVImFq7JWzvc/CMzQ+cgAAIECBAgQIAA6S3QHNF2WdSjuNs/gAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACZAQsQIECAAAECBOjzFkEkVRGHBIsZAAAAAElFTkSuQmCC'
const ICON_STOP_INACTIVE =
	'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAABJmlDQ1BBZG9iZSBSR0IgKDE5OTgpAAAoz2NgYDJwdHFyZRJgYMjNKykKcndSiIiMUmA/z8DGwMwABonJxQWOAQE+IHZefl4qAwb4do2BEURf1gWZxUAa4EouKCoB0n+A2CgltTiZgYHRAMjOLi8pAIozzgGyRZKywewNIHZRSJAzkH0EyOZLh7CvgNhJEPYTELsI6Akg+wtIfTqYzcQBNgfClgGxS1IrQPYyOOcXVBZlpmeUKBhaWloqOKbkJ6UqBFcWl6TmFit45iXnFxXkFyWWpKYA1ULcBwaCEIWgENMAarTQZKAyAMUDhPU5EBy+jGJnEGIIkFxaVAZlMjIZE+YjzJgjwcDgv5SBgeUPQsykl4FhgQ4DA/9UhJiaIQODgD4Dw745AMDGT/0ZOjZcAAAACXBIWXMAAAsTAAALEwEAmpwYAAAMKmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wNi0wNFQwMDowNzoyNSswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNi0wNFQxMToyMjo0NyswMjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDYtMDRUMTE6MjI6NDcrMDI6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjBmM2U0Y2VhLTQ2NDEtNDhhYS04N2I2LWMxYjRlZTJkOWE5NCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjBjYzc0NDRhLWE1ZDUtNmY0NC05NjdjLWU4YWRlZmI2MTYzOCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmNlZDYyMWNiLTU3MmItNGMyZS1hYTU4LTUwYTJiN2YwYzNjZCIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkFkb2JlIFJHQiAoMTk5OCkiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmNlZDYyMWNiLTU3MmItNGMyZS1hYTU4LTUwYTJiN2YwYzNjZCIgc3RFdnQ6d2hlbj0iMjAxOC0wNi0wNFQwMDowNzoyNSswMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo4OTliODFjZC00NzM3LTRmYzAtYWIwYi1jMGY2YzgwNzk1ODkiIHN0RXZ0OndoZW49IjIwMTgtMDYtMDRUMTE6MjI6NDcrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MGYzZTRjZWEtNDY0MS00OGFhLTg3YjYtYzFiNGVlMmQ5YTk0IiBzdEV2dDp3aGVuPSIyMDE4LTA2LTA0VDExOjIyOjQ3KzAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjg5OWI4MWNkLTQ3MzctNGZjMC1hYjBiLWMwZjZjODA3OTU4OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpjZWQ2MjFjYi01NzJiLTRjMmUtYWE1OC01MGEyYjdmMGMzY2QiIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjZWQ2MjFjYi01NzJiLTRjMmUtYWE1OC01MGEyYjdmMGMzY2QiLz4gPHBob3Rvc2hvcDpUZXh0TGF5ZXJzPiA8cmRmOkJhZz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJSZWMgV2hpdGUiIHBob3Rvc2hvcDpMYXllclRleHQ9Ij0iLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJSZWMgcmVkIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI9Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iU2tpcCBCYWNrIFdoaXRlIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI5Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iU2tpcCBCYWNrIEJsdWUiIHBob3Rvc2hvcDpMYXllclRleHQ9IjkiLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJTa2lwIEZ3ZCB3aGl0ZSIgcGhvdG9zaG9wOkxheWVyVGV4dD0iOiIvPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9IlNraXAgRndkIEJsdWUiIHBob3Rvc2hvcDpMYXllclRleHQ9IjoiLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJQbGF5IFdoaXRlIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI0Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iUGxheSBHcmVlbiIgcGhvdG9zaG9wOkxheWVyVGV4dD0iNCIvPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9IlBhdXNlIFdoaXRlIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI7Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iUGF1c2UgWWVsbG93IiBwaG90b3Nob3A6TGF5ZXJUZXh0PSI7Ii8+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iU3RvcCBXaGl0ZSIgcGhvdG9zaG9wOkxheWVyVGV4dD0iJmx0OyIvPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9IlN0b3AgUmVkIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSImbHQ7Ii8+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6VGV4dExheWVycz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4n7NdoAAAAb0lEQVR42u3aMQ0AIADEwPevEbQ8GGAGkhtq4OambXQOAiBAgAABAgQIkAABeh1oJHPXy01AgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAmTB8ygCAgQIECABAgQIEKAvWz9emwZhCZEoAAAAAElFTkSuQmCC'

export function GetPresetDefinitions() {
	const presets = {
		'player:play': {
			type: 'button',
			category: 'Player',
			name: 'Play',
			style: {
				text: '',
				png64: ICON_PLAY_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'play',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_status',
					options: {
						fg: '16777215',
						bg: combineRgb(0, 128, 0),
						playStat: '2',
					},
				},
			],
		},
		'player:pause': {
			type: 'button',
			category: 'Player',
			name: 'Pause',
			style: {
				text: '',
				png64: ICON_PAUSE_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'pause',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_status',
					options: {
						fg: '16777215',
						bg: combineRgb(128, 128, 0),
						playStat: '1',
					},
				},
			],
		},
		'player:stop': {
			type: 'button',
			category: 'Player',
			name: 'Stop',
			style: {
				text: '',
				png64: ICON_STOP_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'stop',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_status',
					options: {
						fg: '16777215',
						bg: combineRgb(128, 0, 0),
						playStat: '0',
					},
				},
			],
		},
		'player:loop': {
			type: 'button',
			category: 'Player',
			name: 'Loop',
			style: {
				text: 'Loop Mode',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'loop',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_loop',
					options: {
						fg: '16777215',
						bg: combineRgb(0, 128, 128),
					},
				},
			],
		},
		'player:repeat': {
			type: 'button',
			category: 'Player',
			name: 'Repeat',
			style: {
				text: 'Repeat Mode',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'repeat',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_repeat',
					options: {
						fg: '16777215',
						bg: combineRgb(128, 0, 128),
						playStat: '0',
					},
				},
			],
		},
		'player:shuffle': {
			type: 'button',
			category: 'Player',
			name: 'Shuffle',
			style: {
				text: 'Shuffle Mode',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'shuffle',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_random',
					options: {
						fg: '16777215',
						bg: combineRgb(0, 0, 128),
						playStat: '0',
					},
				},
			],
		},
		'player:fullscreen': {
			type: 'button',
			category: 'Player',
			name: 'Full Screen',
			style: {
				text: 'Full Screen Mode',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'full',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_full',
					options: {
						fg: '16777215',
						bg: combineRgb(204, 0, 128),
						playStat: '0',
					},
				},
			],
		},
	}

	for (let c = 1; c <= 5; c++) {
		presets[`playlist:play:${c}`] = {
			type: 'button',
			category: 'Play List',
			name: `Play #${c}`,
			style: {
				text: `Play $(vlc:pname_${c})`,
				pngalignment: 'center:center',
				size: 'auto',
				color: combineRgb(164, 164, 164),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'playID',
							options: {
								clip: c,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	return presets
}
