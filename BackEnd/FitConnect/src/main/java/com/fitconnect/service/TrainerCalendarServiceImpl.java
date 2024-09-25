package com.fitconnect.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.fitconnect.auth.PrincipalDetails;
import com.fitconnect.dto.ChatRoomDto;
import com.fitconnect.dto.ExerciseJournalDto;
import com.fitconnect.dto.MemberDto;
import com.fitconnect.dto.TrainerCalendarDto;
import com.fitconnect.dto.UserDto;
import com.fitconnect.handler.AuthSuccessHandler;
import com.fitconnect.repository.MessageDao;
import com.fitconnect.repository.TrainerCalendarDao;

@Service
public class TrainerCalendarServiceImpl implements TrainerCalendarService  {

	@Autowired private TrainerCalendarDao calDao;
	
	@Autowired private MessageDao MsgDao;
	
	//트레이너 전체 캘린저 일정 리스트
	@Override
	public List<TrainerCalendarDto> selectCalenList() {
		//토큰에 저장된 user_id을 user_id이라는 key 값에 담기
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    UserDto userDto = ((PrincipalDetails)authentication.getPrincipal()).getDto();
		return calDao.getCalenList(userDto.getId());
	}

	//트레이너의 특정 일자 일정
	@Override
	public TrainerCalendarDto selectCalenderOne(int t_calendar_id) {
		return calDao.getCalender(t_calendar_id);
	}

	//트레이너 일정 등록
	@Override
	public boolean addSchedule(TrainerCalendarDto dto) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    UserDto userDto = ((PrincipalDetails)authentication.getPrincipal()).getDto();
		dto.setTrainer_num(userDto.getId());
		boolean isSuccess = calDao.insert(dto);
		return isSuccess;
	}

	//트레이너 일정 수정
	@Override
	public boolean updateSchedule(TrainerCalendarDto dto) {
		boolean isSuccess = calDao.update(dto);
		return isSuccess;
	}

	//트레이너 일정 삭제
	@Override
	public boolean deleteSchedule(TrainerCalendarDto dto) {
		dto.setT_calendar_id(dto.getT_calendar_id());
		dto.setMember_num(dto.getMember_num());
		boolean isSuccess = calDao.delete(dto);
		return isSuccess;
	}

	//트레이너와 연동된 회원 중 특정 회원 1명의 정보
	@Override
	public Map<String, Object> selectMemberOne(int member_num) {
		 
		
		return Map.of("dto", calDao.getMemberOne(member_num));
	}

	//트레이너와 연동된 모든 회원 리스트
	@Override
	public List<MemberDto> selectMemberList() {
		//토큰에 저장된 user_num을 user_num이라는 key 값에 담기
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    UserDto userDto = ((PrincipalDetails)authentication.getPrincipal()).getDto();
		return calDao.getMemberList(userDto.getId());
	}

	@Override
	public boolean disconnect(int member_num) {
		//채팅방 삭제 추가
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    UserDto userDto = ((PrincipalDetails)authentication.getPrincipal()).getDto();
	    ChatRoomDto chatDto = MsgDao.getChatRoom(userDto.getId());
	    String topic = chatDto.getTopic();
		MsgDao.deleteChat(topic);
		
		boolean isSuccess = calDao.disconnect(member_num);
		return isSuccess;
	}


}
