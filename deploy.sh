#실행중인 컨테이너 체크(blue컨테이너 확인)
EXIST_BLUE=$(docker-compose -p ${web}-blue -f docker-compose.blue.yaml ps | grep Up)

if [ -z "$EXIST_BLUE"]; then
    echo "blue up"
    docker-compose -p ${web}-blue -f docker-compose.blue.yaml up -d
    BEFORE_COMPOSE_COLOR="green"
    AFTER_COMPOSE_COLOR="blue"
else
    echo "green up"
    docker-compose -p ${web}-green -f docker-compose.blue.yaml up -d
    BEFORE_COMPOSE_COLOR="blue"
    AFTER_COMPOSE_COLOR="green"
fi

sleep 10
#동작확인
EXIST_AFTER=$(docker-compose -p ${web}-${green} -f docker-compose.${green}.yaml ps | grep Up)
if [ -n "$EXIST_AFTER"]; then
    docker-compose -p ${web}-${blue} -f docker-compose.${blue}.yaml down
    echo "BEFORE_COMPOSE_COLOR down"
fi