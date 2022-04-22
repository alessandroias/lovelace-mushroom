import { HomeAssistant, computeStateDisplay } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { html } from "lit";
import { MEDIA_PLAYER_ENTITY_DOMAINS } from "../cards/media-player-card/const";
import { isAvailable, isUnknown } from "../ha/data/entity";
import { computeMediaDescription, MediaPlayerEntity } from "../ha/data/media-player";


export const INFOS = ["name", "state", "last-changed", "last-updated", "none"] as const;
export const MEDIA_PLAYER_INFO = ["media-title", "media-description"] as const;

const TIMESTAMP_STATE_DOMAINS = ["button", "input_button", "scene"];

export type Info = typeof INFOS[number];
export type MediaPlayerInfo = typeof MEDIA_PLAYER_INFO[number];

export function getInfo(
    info: Info | MediaPlayerInfo,
    name: string,
    state: string,
    entity: HassEntity,
    hass: HomeAssistant
) {
    const domain = entity.entity_id.split(".")[0];
    switch (info) {
        case "name":
            return name;
        case "state":
            if (
                (entity.attributes.device_class === "timestamp" ||
                    TIMESTAMP_STATE_DOMAINS.includes(domain)) &&
                isAvailable(entity) &&
                !isUnknown(entity)
            ) {
                return html`
                    <ha-relative-time
                        .hass=${hass}
                        .datetime=${entity.state}
                        capitalize
                    ></ha-relative-time>
                `;
            } else {
                return state;
            }
        case "last-changed":
            return html`
                <ha-relative-time
                    .hass=${hass}
                    .datetime=${entity.last_changed}
                    capitalize
                ></ha-relative-time>
            `;
        case "last-updated":
            return html`
                <ha-relative-time
                    .hass=${hass}
                    .datetime=${entity.last_updated}
                    capitalize
                ></ha-relative-time>
            `;
        case "none":
            return undefined;
        case "media-title":
            if (MEDIA_PLAYER_ENTITY_DOMAINS.includes(domain))
                return entity.attributes.media_title || name;
            return undefined
        case "media-description":
            if (MEDIA_PLAYER_ENTITY_DOMAINS.includes(domain))
                return (computeMediaDescription(entity as MediaPlayerEntity) ||
                    computeStateDisplay(hass.localize, entity, hass.locale));
            return undefined
    }
}
