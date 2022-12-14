<template>
    <div class="time-use-report">
        <h1 class="page-title">{{ $t('navigation.time-use-report') }}</h1>
        <div class="controls-row">
            <div class="calendar controls-row__item">
                <Calendar :sessionStorageKey="sessionStorageKey" @change="onCalendarChange" />
            </div>
            <div class="select controls-row__item">
                <UserSelect @change="onUsersChange" />
            </div>
        </div>
        <div class="at-container">
            <div class="total-time-row">
                <span class="total-time-label">{{ $t('field.total_time') }}</span>
                <span class="total-time-value">{{ formatDurationString(totalTime) }}</span>
            </div>
            <div v-if="Object.keys(userReportsList).length && !isDataLoading">
                <list :reportsList="userReportsList" />
            </div>
            <div v-else class="at-container__inner no-data">
                <preloader v-if="isDataLoading" />
                <span>{{ $t('message.no_data') }}</span>
            </div>
        </div>
    </div>
</template>

<script>
    import List from './TimeUseReport/List';
    import UsersService from '@/services/resource/user.service';
    import TimeUseReportService from '_internal/TimeUseReport/service/time-use-report.service';
    import { formatDurationString } from '@/utils/time';
    import moment from 'moment';
    import Preloader from '@/components/Preloader';
    import UserSelect from '@/components/UserSelect';
    import Calendar from '@/components/Calendar';

    const timeUseService = new TimeUseReportService();
    const usersService = new UsersService();

    export default {
        components: {
            List,
            Preloader,
            UserSelect,
            Calendar,
        },
        data() {
            const sessionStorageKey = 'amazingcat.session.storage.timeuse_report';

            return {
                datepickerDateStart: '',
                datepickerDateEnd: '',
                userReportsList: [],
                isDataLoading: false,
                userIDs: [],
                sessionStorageKey: sessionStorageKey,
            };
        },
        computed: {
            totalTime() {
                return this.userReportsList.reduce((total, current) => total + current.time, 0);
            },
        },
        methods: {
            formatDurationString,

            async sendRequests() {
                try {
                    this.users = (await usersService.getAll()).data;
                    await this.getReport();
                } catch ({ response }) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(response ? response : 'request to users is canceled');
                    }
                }
            },
            async getReport() {
                if (this.userIDs === 'undefined' || !this.datepickerDateStart) {
                    return;
                }

                this.isDataLoading = true;
                try {
                    const { data } = await timeUseService.getReport(
                        this.datepickerDateStart,
                        this.datepickerDateEnd,
                        this.userIDs,
                    );
                    this.userReportsList = data.data;
                } catch ({ response }) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(response ? response : 'request to time use report is canceled');
                    }
                }

                this.isDataLoading = false;
            },
            onUsersChange(userIDs) {
                this.userIDs = userIDs;
                if (this._isMounted) {
                    this.getReport();
                }
            },
            onCalendarChange({ start, end }) {
                this.datepickerDateStart = start;
                this.datepickerDateEnd = end;
                this.getReport();
            },
            onTimezoneChange(timezone) {
                this.setTimezone(timezone);
                this.getReport();
            },
        },
        async mounted() {
            await this.sendRequests();
        },
    };
</script>

<style lang="scss" scoped>
    .at-container {
        overflow: hidden;
    }

    .no-data {
        text-align: center;
        font-weight: bold;
        position: relative;
    }

    .total-time-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 21px;
        color: $black-900;
        font-size: 2rem;
        font-weight: bold;
    }
</style>
