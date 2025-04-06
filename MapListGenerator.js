// Need to finish generation code
// then buttons to filter modes
// only show all maps if toggle is on since its likely you dont actually need per-map granularity
class ModeOptions {
    Checkpoint_Insurgents = true;
    Checkpoint_Security = true;
    Hardcore_Checkpoint_Insurgents = true;
    Hardcore_Checkpoint_Security = true;
    Outpost = true;
    Survival = true;
}
class MapItem {
    name;
    day = new ModeOptions();
    night = new ModeOptions();
    constructor(name) {
        this.name = name;
    }
}
const map_names = [
    "Bab",
    "Citadel",
    "Crossing",
    "Farmhouse",
    "Gap",
    "LastLight",
    "Hideout",
    "Hillside",
    "Ministry",
    "Outskirts",
    "Precinct",
    "Refinery",
    "Summit",
    "PowerPlant",
    "Tell",
    "Tideway",
    "Prison",
    "Trainyard"
];
const data = {
    maps: [],
    generated_list: "",
    can_see_all_maps: false,
    mode_names: Object.keys(new ModeOptions),
    mode_short: [
        'CI',
        'CS',
        'HI',
        'HS',
        'O',
        'S'
    ],
    generate_list() {
        this.generated_list = '';
        for (const map of this.maps) {
            for (const time of ['Day', 'Night']) {
                for (let [mode, value] of Object.entries(map[time.toLowerCase()])) {
                    if (!value) {
                        continue;
                    }
                    let is_hardcore = mode.startsWith('Hardcore');
                    // Hardcore is an edge case
                    if (is_hardcore) {
                        mode = mode.substring("Hardcore_".length);
                    }
                    let line = this.get_line(map.name, mode, time, is_hardcore);
                    this.generated_list += line;
                }
            }
        }
        navigator.clipboard.writeText(this.generated_list);
        this.show_copy_message();
    },
    get_line(name, mode, time, is_hardcore) {
        return `(Scenario="Scenario_${name}_${mode}",Lighting="${time}"${is_hardcore ? ',Mode="CheckpointHardcore"' : ''})\n`;
    },
    init_options() {
        for (const map of map_names) {
            this.maps.push(new MapItem(map));
        }
    },
    get_mode_names() {
        let modes = new ModeOptions();
        return Object.keys(modes).map(mode => this.snake_to_proper(mode));
    },
    snake_to_proper(str) {
        return str.split('_').map(word => word[0].toUpperCase() + word.substring(1)).join(' ');
    },
    mode_labels() {
        return this.get_mode_names().map((mode_name, index) => {
            return {long_name: mode_name, short_name: this.mode_short[index]};
        });
    },
    toggle_one_mode(mode_name, time, value) {
        for (const map of this.maps) {
            Alpine.reactive(map)[time][mode_name] = value;
        }
    },
    toggle_by_time(time, value) {
        for (const mode_name of this.mode_names) {
            this.toggle_one_mode(mode_name, time, value);
        }
        document.querySelectorAll(`input[name=${time}`).forEach(x => x.checked = value);
    },
    generator_text: 'Generate MapCycle',
    show_copy_message() {
        this.generator_text = 'Generated. MapCycle.txt copied to clipboard.';
        setTimeout(this.revert_copy_message, 2000);
    },
    revert_copy_message() {
        Alpine.reactive(data).generator_text = 'Generate MapCycle';
    },
}
data.init_options();